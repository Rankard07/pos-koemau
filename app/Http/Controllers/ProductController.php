<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Supply;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('products/index', [
            'title' => 'Daftar Produk KoeMau',
            'products' => Product::all(),
        ]);
    }

    /**
     * Get list of available images from public/images folder.
     * Returns grouped by folder structure.
     */
    public function listAvailableImages()
    {
        $imagesByFolder = [];
        $imagePath = public_path('images');
        $folders = ['Cireng', 'Dimsum', 'Katsu', 'Nugget', 'Risol-Corndog', 'Siomay'];

        foreach ($folders as $folder) {
            $folderPath = $imagePath.'/'.$folder;
            $imagesByFolder[$folder] = [];

            if (File::isDirectory($folderPath)) {
                $files = File::files($folderPath);
                foreach ($files as $file) {
                    $extension = strtolower($file->getExtension());
                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $imagesByFolder[$folder][] = [
                            'path' => $folder.'/'.$file->getFilename(),
                            'name' => $file->getFilename(),
                        ];
                    }
                }
                sort($imagesByFolder[$folder]);
            }
        }

        // Remove empty folders
        $imagesByFolder = array_filter($imagesByFolder, fn ($images) => ! empty($images));

        return response()->json($imagesByFolder);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $availableImages = $this->getAvailableImagesForView();

        return Inertia::render('products/create', [
            'title' => 'Beli Produk Baru',
            'availableImages' => $availableImages,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, &$validated): void {
            // Priority 1: Upload new image file
            if ($request->hasFile('image')) {
                $validated['image'] = $request->file('image')->store('products', 'public');
            }
            // Priority 2: Select image from public/images folder
            elseif ($request->filled('image_file')) {
                $imagePath = $request->input('image_file');

                // Security: Validate path to prevent directory traversal
                if ($this->isValidImagePath($imagePath)) {
                    $sourceFile = public_path('images/'.$imagePath);
                    if (File::exists($sourceFile)) {
                        $fileName = basename($imagePath);
                        $destinationDir = storage_path('app/public/products');

                        // Create directory if not exists
                        if (! File::exists($destinationDir)) {
                            File::makeDirectory($destinationDir, 0755, true);
                        }

                        $destination = $destinationDir.'/'.$fileName;
                        File::copy($sourceFile, $destination);
                        $validated['image'] = 'products/'.$fileName;
                    }
                }
            }

            $product = Product::create($validated);

            $initialStock = (int) $product->stock;
            $purchasePrice = (float) $product->purchase_price;
            $totalAmount = $initialStock * $purchasePrice;

            if ($initialStock > 0 && $purchasePrice >= 0) {
                Supply::create([
                    'supplier_name' => 'Input Produk',
                    'product_id' => $product->id,
                    'quantity' => $initialStock,
                    'purchase_price' => $purchasePrice,
                    'total_amount' => $totalAmount,
                    'supply_date' => now()->toDateString(),
                    'note' => 'Auto dari + Beli Produk',
                ]);

                Expense::create([
                    'description' => "Supply awal {$product->product_name} dari + Beli Produk",
                    'amount' => $totalAmount,
                    'date' => now()->toDateString(),
                    'category' => 'pembelian_stok',
                ]);
            }
        });

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $availableImages = $this->getAvailableImagesForView();

        return Inertia::render('products/edit', [
            'title' => 'Edit Produk',
            'product' => $product,
            'availableImages' => $availableImages,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        // Priority 1: Upload new image file
        if ($request->hasFile('image')) {
            // Delete old image if exists
            $this->deleteImageFile($product->image);
            $validated['image'] = $request->file('image')->store('products', 'public');
        }
        // Priority 2: Select image from public/images folder
        elseif ($request->filled('image_file')) {
            $imagePath = $request->input('image_file');

            // Security: Validate path
            if ($this->isValidImagePath($imagePath)) {
                $sourceFile = public_path('images/'.$imagePath);
                if (File::exists($sourceFile)) {
                    // Delete old image if exists
                    $this->deleteImageFile($product->image);

                    $fileName = basename($imagePath);
                    $destinationDir = storage_path('app/public/products');

                    if (! File::exists($destinationDir)) {
                        File::makeDirectory($destinationDir, 0755, true);
                    }

                    $destination = $destinationDir.'/'.$fileName;
                    File::copy($sourceFile, $destination);
                    $validated['image'] = 'products/'.$fileName;
                }
            }
        }
        // If neither image field is provided, keep existing image
        else {
            unset($validated['image']);
        }

        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        DB::transaction(function () use ($product): void {
            // Hapus supply otomatis yang dibuat dari alur + Beli Produk.
            // Ini mencegah pelanggaran FK saat produk baru dihapus.
            Supply::query()
                ->where('product_id', $product->id)
                ->where('note', 'Auto dari + Beli Produk')
                ->delete();

            // Delete image file from storage
            $this->deleteImageFile($product->image);

            // Delete product record
            $product->delete();
        });

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus');
    }

    /**
     * Helper method: Delete image file from storage
     */
    private function deleteImageFile(?string $imagePath): void
    {
        if (! empty($imagePath) && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    /**
     * Helper method: Validate image path for security (prevent directory traversal)
     */
    private function isValidImagePath(string $path): bool
    {
        $pattern = '/^(Cireng|Dimsum|Katsu|Nugget|Risol-Corndog|Siomay)\/[\w\s\(\)\-\.\[\]]+\.(jpg|jpeg|png|webp)$/i';

        return preg_match($pattern, $path) === 1;
    }

    /**
     * Helper method: Get available images formatted for frontend view
     */
    private function getAvailableImagesForView(): array
    {
        $imagesByFolder = [];
        $imagePath = public_path('images');
        $folders = ['Cireng', 'Dimsum', 'Katsu', 'Nugget', 'Risol-Corndog', 'Siomay'];

        foreach ($folders as $folder) {
            $folderPath = $imagePath.'/'.$folder;
            $imagesByFolder[$folder] = [];

            if (File::isDirectory($folderPath)) {
                $files = File::files($folderPath);
                foreach ($files as $file) {
                    $extension = strtolower($file->getExtension());
                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $imagesByFolder[$folder][] = [
                            'path' => $folder.'/'.$file->getFilename(),
                            'name' => $file->getFilename(),
                        ];
                    }
                }
                sort($imagesByFolder[$folder]);
            }
        }

        return $imagesByFolder;
    }
}
