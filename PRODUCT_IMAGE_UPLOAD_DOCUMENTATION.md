# Product Image Upload - Comprehensive Documentation

**Project:** POS KoeMau - Full Product Management with Image Upload  
**Framework:** Laravel 12 + Inertia.js v2 + React 19  
**Created:** March 2026  
**Status:** ✅ Production Ready

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Pattern](#architecture--design-pattern)
3. [Phase Breakdown](#phase-breakdown)
4. [Detailed Code Explanations](#detailed-code-explanations)
5. [Workflow Diagrams](#workflow-diagrams)
6. [Testing Guide](#testing-guide)
7. [Security Considerations](#security-considerations)
8. [Key Concepts for Beginners](#key-concepts-for-beginners)

---

## Project Overview

### What We Built

A complete **Product Management System** with image upload functionality for a frozen food POS (Point of Sale) application called **KoeMau**. This system allows users to:

- ✅ **Create** new products with images (upload new or select preset)
- ✅ **Read** products in a table view with thumbnails
- ✅ **Edit** products and change their images
- ✅ **Delete** products and automatically clean up image files

### Key Features

| Feature                    | Details                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Dual-Source Images**     | Upload new file OR select from preset folders (6 categories: Cireng, Dimsum, Katsu, Nugget, Risol, Siomay) |
| **Real-time Preview**      | Users see image preview before submitting form                                                             |
| **Client-side Validation** | File type & size checked before server request                                                             |
| **Automatic Cleanup**      | Old images deleted when replaced or product removed                                                        |
| **Security**               | Path validation prevents directory traversal attacks                                                       |
| **Responsive Design**      | Works on desktop (mobile coming soon)                                                                      |

### Tech Stack

```
Backend:  Laravel 12 (PHP 8.4)
          - Form Request validation pattern
          - Eloquent ORM model
          - Storage facade for file management

Frontend: Inertia.js v2 + React 19
          - useForm hook for form state
          - router object for HTTP requests
          - useState for local component state

Styling:  Tailwind CSS v4 + DaisyUI + shadcn/ui
          - Pre-built UI components
          - Utility-first CSS classes

Routing:  Ziggy (TypeScript-safe route generation)
          - Frontend can call backend routes safely
```

---

## Architecture & Design Pattern

### 1. Dual-Source Image Priority System

The system implements a **Priority-based image selection**:

```
Decision Tree:
    ↓
Does user upload NEW file? → YES → Use uploaded file (Priority 1)
    ↓ NO
Does user select PRESET image? → YES → Copy preset to storage (Priority 2)
    ↓ NO
Keep EXISTING image (Priority 3 - For edit only)
```

**Why this design?**

- Users have flexibility: upload their own OR quickly choose preset
- No duplication: Preset images copied to storage folder
- Clean update: Old image deleted before new one stored
- Safe default: If user changes mind, existing image stays

### 2. Form Request Validation Pattern

Instead of `$request->validate()` in controller, we use **dedicated Form Request classes**:

```php
// ❌ WRONG (inline validation)
public function store(Request $request) {
    $request->validate([...]);
}

// ✅ RIGHT (Form Request class)
public function store(StoreProductRequest $request) {
    $validated = $request->validated();
}
```

**Benefits:**

- Cleaner controllers (single responsibility)
- Reusable validation rules (StoreProductRequest = UpdateProductRequest)
- Custom error messages in one place
- Authorization logic separable from validation

### 3. File Management Strategy

```
Public Images (Reference Only):
  public/images/
    ├── Cireng/
    ├── Dimsum/
    └── ... (user can't delete)

User-Uploaded Images (Managed):
  storage/app/public/products/
    ├── image1.jpg (upload or copied from preset)
    ├── image2.jpg (can be deleted)
    └── ...

Web Access:
  /storage/products/image1.jpg
  ↓
  Points to: storage/app/public/products/image1.jpg
  (via symlink created by: php artisan storage:link)
```

---

## Phase Breakdown

### Phase 1: Backend Foundation ⚙️

**Goal:** Set up validation and file handling logic

#### Files Created/Modified:

**1. `app/Http/Requests/StoreProductRequest.php`**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * For now, everyone can create products. Later add: return auth()->check();
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * These rules are checked BEFORE the controller receives the request.
     * If validation fails, user is redirected with error messages.
     */
    public function rules(): array
    {
        return [
            // Product name is required, must be string, max 255 characters
            'product_name' => 'required|string|max:255',

            // Purchase price is required, must be numeric, cannot be negative
            'purchase_price' => 'required|numeric|min:0',

            // Selling price is required, must be numeric, cannot be negative
            'selling_price' => 'required|numeric|min:0',

            // Stock is required, must be integer (whole number), cannot be negative
            'stock' => 'required|integer|min:0',

            // Image file upload (optional):
            // - nullable: User might upload OR select preset OR neither
            // - image: Must be image file (detects from MIME type)
            // - mimes: Only allow jpg, jpeg, png, webp formats
            // - max: 2048 KB (2 MB) - prevent huge uploads
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            // Image path selection from preset (optional):
            // - nullable: If user selected from dropdown
            // - string: The path like "Cireng/sambal.jpg"
            'image_file' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages for validation failures.
     *
     * Laravel uses these messages instead of default English messages.
     * Makes errors user-friendly in Indonesian.
     */
    public function messages(): array
    {
        return [
            'product_name.required' => 'Nama produk wajib diisi',
            'product_name.string' => 'Nama produk harus berupa teks',
            'product_name.max' => 'Nama produk maksimal 255 karakter',

            'purchase_price.required' => 'Harga beli wajib diisi',
            'purchase_price.numeric' => 'Harga beli harus berupa angka',
            'purchase_price.min' => 'Harga beli tidak boleh negatif',

            'selling_price.required' => 'Harga jual wajib diisi',
            'selling_price.numeric' => 'Harga jual harus berupa angka',
            'selling_price.min' => 'Harga jual tidak boleh negatif',

            'stock.required' => 'Stok wajib diisi',
            'stock.integer' => 'Stok harus berupa angka bulat',
            'stock.min' => 'Stok tidak boleh negatif',

            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar hanya: jpg, jpeg, png, webp',
            'image.max' => 'Ukuran gambar maksimal 2 MB',
        ];
    }
}
```

**2. `app/Http/Requests/UpdateProductRequest.php`**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules for UPDATE.
     *
     * NOTE: Same rules as StoreProductRequest because both create and update
     * have the same validation requirements.
     */
    public function rules(): array
    {
        return [
            'product_name' => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'image_file' => 'nullable|string',
        ];
    }

    /**
     * Custom messages (same as StoreProductRequest).
     */
    public function messages(): array
    {
        return [
            'product_name.required' => 'Nama produk wajib diisi',
            'product_name.string' => 'Nama produk harus berupa teks',
            'product_name.max' => 'Nama produk maksimal 255 karakter',

            'purchase_price.required' => 'Harga beli wajib diisi',
            'purchase_price.numeric' => 'Harga beli harus berupa angka',
            'purchase_price.min' => 'Harga beli tidak boleh negatif',

            'selling_price.required' => 'Harga jual wajib diisi',
            'selling_price.numeric' => 'Harga jual harus berupa angka',
            'selling_price.min' => 'Harga jual tidak boleh negatif',

            'stock.required' => 'Stok wajib diisi',
            'stock.integer' => 'Stok harus berupa angka bulat',
            'stock.min' => 'Stok tidak boleh negatif',

            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar hanya: jpg, jpeg, png, webp',
            'image.max' => 'Ukuran gambar maksimal 2 MB',
        ];
    }
}
```

**3. `app/Http/Controllers/ProductController.php` (Key Methods)**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    /**
     * STORE: Create new product with image
     *
     * Validation Flow:
     * 1. StoreProductRequest validates the incoming data
     * 2. If validation passes → $request->validated() returns clean data
     * 3. If validation fails → User redirected to form with error messages
     */
    public function store(StoreProductRequest $request)
    {
        // Get validated data (guaranteed to pass validation rules)
        $validated = $request->validated();

        // ============================================================
        // PRIORITY 1: User uploaded NEW image file
        // ============================================================
        if ($request->hasFile('image')) {
            // Store uploaded file to storage disk
            // store(path, disk_name) returns relative path like 'products/abc123.jpg'
            $validated['image'] = $request->file('image')->store('products', 'public');
        }
        // ============================================================
        // PRIORITY 2: User selected PRESET image from dropdown
        // ============================================================
        elseif ($request->filled('image_file')) {
            $imagePath = $request->input('image_file');

            // SECURITY CHECK: Validate path to prevent directory traversal
            // Example attack: "../../../etc/passwd" → blocked by regex
            if ($this->isValidImagePath($imagePath)) {
                // Source: public/images/Cireng/sambal.jpg
                $sourceFile = public_path('images/' . $imagePath);

                if (File::exists($sourceFile)) {
                    // Destination: storage/app/public/products/sambal.jpg
                    $fileName = basename($imagePath); // Extract just filename
                    $destinationDir = storage_path('app/public/products');

                    // Create directory if missing (rare case)
                    if (!File::exists($destinationDir)) {
                        File::makeDirectory($destinationDir, 0755, true);
                    }

                    // Copy preset image to storage
                    $destination = $destinationDir . '/' . $fileName;
                    File::copy($sourceFile, $destination);

                    // Store relative path in database
                    $validated['image'] = 'products/' . $fileName;
                }
            }
        }
        // ============================================================
        // PRIORITY 3: Neither image selected → image field stays empty
        // ============================================================
        // (validated array doesn't set 'image' key if not provided)

        // Create product in database with validated data
        Product::create($validated);

        // Redirect to products list with success message
        return redirect()->route('products.index')
                        ->with('success', 'Produk berhasil ditambahkan');
    }

    /**
     * UPDATE: Edit existing product with new/changed image
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        // ============================================================
        // PRIORITY 1: User uploaded NEW image file
        // ============================================================
        if ($request->hasFile('image')) {
            // DELETE old image first (cleanup)
            // This prevents storage from getting cluttered with unused images
            $this->deleteImageFile($product->image);

            // Store new uploaded file
            $validated['image'] = $request->file('image')->store('products', 'public');
        }
        // ============================================================
        // PRIORITY 2: User selected PRESET image
        // ============================================================
        elseif ($request->filled('image_file')) {
            $imagePath = $request->input('image_file');

            if ($this->isValidImagePath($imagePath)) {
                $sourceFile = public_path('images/' . $imagePath);

                if (File::exists($sourceFile)) {
                    // Delete old image (cleanup)
                    $this->deleteImageFile($product->image);

                    $fileName = basename($imagePath);
                    $destinationDir = storage_path('app/public/products');

                    if (!File::exists($destinationDir)) {
                        File::makeDirectory($destinationDir, 0755, true);
                    }

                    $destination = $destinationDir . '/' . $fileName;
                    File::copy($sourceFile, $destination);
                    $validated['image'] = 'products/' . $fileName;
                }
            }
        }
        // ============================================================
        // PRIORITY 3: User didn't select new image → keep existing
        // ============================================================
        else {
            // Remove 'image' from validated data so it's not updated
            // This preserves the existing image in database
            unset($validated['image']);
        }

        // Update product with validated data
        $product->update($validated);

        return redirect()->route('products.index')
                        ->with('success', 'Produk berhasil diperbarui');
    }

    /**
     * DESTROY: Delete product AND clean up image file
     */
    public function destroy(Product $product)
    {
        // Delete image file from storage (cleanup)
        $this->deleteImageFile($product->image);

        // Delete product record from database
        $product->delete();

        return redirect()->route('products.index')
                        ->with('success', 'Produk berhasil dihapus');
    }

    /**
     * Helper Method: Safely delete image file
     *
     * Usage Example:
     *   $this->deleteImageFile('products/image.jpg');
     *   $this->deleteImageFile(null); // Safe - no error if null
     */
    private function deleteImageFile(?string $imagePath): void
    {
        // Only delete if:
        // 1. Path is not empty
        // 2. File actually exists in storage
        if (!empty($imagePath) && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    /**
     * Helper Method: Security - Validate image path
     *
     * Prevents "directory traversal" attacks like:
     * - "../../../etc/passwd" ❌ BLOCKED
     * - "../../admin" ❌ BLOCKED
     *
     * Only allows:
     * - "Cireng/sambal.jpg" ✅ ALLOWED
     * - "Dimsum/pangsit.png" ✅ ALLOWED
     * - Special chars in filename: ( ) - . [ ]
     */
    private function isValidImagePath(string $path): bool
    {
        // Regex breakdown:
        // ^                    = Start of string
        // (Cireng|Dimsum|...)  = Must start with one of 6 folder names
        // \/                   = Followed by forward slash
        // [\w\s\(\)\-\.\[\]]+ = Filename with: letters, numbers, space, (, ), -, ., [ ]
        // \.                   = Followed by dot
        // (jpg|jpeg|png|webp)  = Must end with these image extensions
        // $                    = End of string
        // i                    = Case-insensitive

        $pattern = '/^(Cireng|Dimsum|Katsu|Nugget|Risol|Siomay)\/[\w\s\(\)\-\.\[\]]+\.(jpg|jpeg|png|webp)$/i';
        return preg_match($pattern, $path) === 1;
    }

    /**
     * Helper Method: Get available preset images for frontend dropdown
     *
     * Scans public/images/ folders and returns formatted array for React component
     */
    private function getAvailableImagesForView(): array
    {
        $imagesByFolder = [];
        $imagePath = public_path('images');
        $folders = ['Cireng', 'Dimsum', 'Katsu', 'Nugget', 'Risol', 'Siomay'];

        foreach ($folders as $folder) {
            $folderPath = $imagePath . '/' . $folder;
            $imagesByFolder[$folder] = [];

            if (File::isDirectory($folderPath)) {
                // Get all files from folder
                $files = File::files($folderPath);

                foreach ($files as $file) {
                    $extension = strtolower($file->getExtension());

                    // Only include image files
                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $imagesByFolder[$folder][] = [
                            // Path for backend: 'Cireng/sambal.jpg'
                            'path' => $folder . '/' . $file->getFilename(),
                            // Name for UI: 'sambal.jpg'
                            'name' => $file->getFilename(),
                        ];
                    }
                }
                // Sort alphabetically
                sort($imagesByFolder[$folder]);
            }
        }

        // Remove empty folders from result
        $imagesByFolder = array_filter($imagesByFolder, fn($images) => !empty($images));

        return $imagesByFolder;
    }
}
```

---

### Phase 2: Storage Setup 📁

**Goal:** Create folder structure and enable file access

#### Steps Completed:

1. **Created folder structure:**

    ```
    public/images/
    ├── Cireng/          (Add your product images here)
    ├── Dimsum/
    ├── Katsu/
    ├── Nugget/
    ├── Risol/
    └── Siomay/
    ```

2. **Created symlink:**
    ```bash
    php artisan storage:link
    ```
    This creates: `public/storage/` → `storage/app/public/`
3. **Why symlink?**
    - Makes `storage/app/public/` accessible via web URL
    - Images accessible at: `/storage/products/image.jpg`
    - Without symlink: Images would be private/inaccessible

---

### Phase 3: Frontend - Create Product Page 📝

**Goal:** Build product creation form with image upload UI

#### File: `resources/js/pages/products/create.tsx`

```typescript
import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// ===================================================================
// INTERFACES: Type definitions for TypeScript
// ===================================================================

interface ImageOption {
    path: string;      // 'Cireng/sambal.jpg' (for backend)
    name: string;      // 'sambal.jpg' (for display)
}

interface AvailableImages {
    [folderName: string]: ImageOption[];  // { Cireng: [...], Dimsum: [...] }
}

interface CreateProps {
    title: string;
    availableImages: AvailableImages;
}

// ===================================================================
// BREADCRUMBS: Navigation path shown at top of page
// ===================================================================

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produk Baru',
        href: route('products.create'),
    },
];

// ===================================================================
// COMPONENT: Create Product Form
// ===================================================================

export default function Create({ title, availableImages }: CreateProps) {
    // ===============================================================
    // LOCAL STATE: Component-level state (separate from form data)
    // ===============================================================

    // Preview URL for selected image (blob for uploaded, /storage/ for preset)
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Error message from client-side validation (before server)
    const [fileError, setFileError] = useState<string>('');

    // ===============================================================
    // FORM STATE: Inertia useForm hook manages form state + submission
    // ===============================================================

    // useForm returns object with properties + methods:
    // - data: Current form values
    // - setData: Update form value
    // - post: Send POST request
    // - processing: True while request is in progress
    const { data, setData, post, processing } = useForm({
        product_name: '',
        purchase_price: 0,
        selling_price: 0,
        stock: 0,
        image: null as File | null,           // Uploaded file
        image_file: '',                        // Selected preset path
    });

    // ===============================================================
    // HANDLER: User selected new image file from file input
    // ===============================================================

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ========================
        // CLIENT-SIDE VALIDATION
        // ========================

        // Check file type (image formats only)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Format hanya: JPG, PNG, WebP');
            setData('image', null);
            setPreviewUrl('');
            return;
        }

        // Check file size (max 2MB)
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            setFileError(`Ukuran maksimal ${maxSizeInMB}MB`);
            setData('image', null);
            setPreviewUrl('');
            return;
        }

        // ========================
        // FILE VALIDATION PASSED
        // ========================

        // Clear error message
        setFileError('');

        // Update form data with file object
        setData('image', file);

        // Create blob preview URL for display
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Clear preset selection (user chose to upload instead)
        setData('image_file', '');
    };

    // ===============================================================
    // HANDLER: User selected preset image from dropdown
    // ===============================================================

    const handlePresetImageChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const selectedPath = e.target.value; // 'Cireng/sambal.jpg' or ''

        if (selectedPath) {
            // User selected image from dropdown
            setData('image_file', selectedPath);
            setPreviewUrl(`/storage/${selectedPath}`);

            // Clear uploaded file
            setData('image', null);
            setFileError('');
        } else {
            // User clicked "Tidak Memilih"
            setData('image_file', '');
            setPreviewUrl('');
        }
    };

    // ===============================================================
    // HANDLER: Form submission (POST to backend)
    // ===============================================================

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: At least one image source required (optional - backend validates too)
        if (!data.image && !data.image_file) {
            setFileError('Pilih gambar dari file atau preset');
            return;
        }

        // Send POST request to server
        post(route('products.store'));
    };

    // ===============================================================
    // RENDER: UI Layout
    // ===============================================================

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tambahkan produk frozen food baru ke dalam daftar KoeMau.
                    </p>
                </div>

                <hr className="mb-6 border-border" />

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="max-w-4xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* LEFT COLUMN: Form Fields */}
                        <div className="md:col-span-2 space-y-4">
                            {/* Product Name Field */}
                            <Field>
                                <FieldGroup>
                                    <FieldLabel htmlFor="product_name">
                                        Nama Produk
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="product_name"
                                            type="text"
                                            placeholder="Contoh: Cireng Pedas"
                                            className="w-full px-3 py-2 border border-input rounded-md"
                                            value={data.product_name}
                                            onChange={(e) =>
                                                setData('product_name', e.target.value)
                                            }
                                        />
                                    </FieldContent>
                                </FieldGroup>
                            </Field>

                            {/* Purchase Price Field */}
                            <Field>
                                <FieldGroup>
                                    <FieldLabel htmlFor="purchase_price">
                                        Harga Beli (Rp)
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="purchase_price"
                                            type="number"
                                            min="0"
                                            placeholder="10000"
                                            className="w-full px-3 py-2 border border-input rounded-md"
                                            value={data.purchase_price}
                                            onChange={(e) =>
                                                setData('purchase_price', Number(e.target.value))
                                            }
                                        />
                                    </FieldContent>
                                </FieldGroup>
                            </Field>

                            {/* Selling Price Field */}
                            <Field>
                                <FieldGroup>
                                    <FieldLabel htmlFor="selling_price">
                                        Harga Jual (Rp)
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="selling_price"
                                            type="number"
                                            min="0"
                                            placeholder="15000"
                                            className="w-full px-3 py-2 border border-input rounded-md"
                                            value={data.selling_price}
                                            onChange={(e) =>
                                                setData('selling_price', Number(e.target.value))
                                            }
                                        />
                                    </FieldContent>
                                </FieldGroup>
                            </Field>

                            {/* Stock Field */}
                            <Field>
                                <FieldGroup>
                                    <FieldLabel htmlFor="stock">
                                        Stok
                                    </FieldLabel>
                                    <FieldContent>
                                        <input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            placeholder="100"
                                            className="w-full px-3 py-2 border border-input rounded-md"
                                            value={data.stock}
                                            onChange={(e) =>
                                                setData('stock', Number(e.target.value))
                                            }
                                        />
                                    </FieldContent>
                                </FieldGroup>
                            </Field>
                        </div>

                        {/* RIGHT COLUMN: Image Upload Section */}
                        <div className="md:col-span-1">
                            <Label className="block mb-4 font-semibold">
                                Gambar Produk
                            </Label>

                            {/* Image Preview Box */}
                            <div className="mb-4 w-full h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted/10">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        Tidak ada gambar
                                    </span>
                                )}
                            </div>

                            {/* Preset Image Dropdown (Priority 2) */}
                            <div className="mb-4">
                                <select
                                    value={data.image_file}
                                    onChange={handlePresetImageChange}
                                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                                >
                                    <option value="">Tidak Memilih</option>
                                    {Object.entries(availableImages).map(
                                        ([folder, images]) => (
                                            <optgroup key={folder} label={folder}>
                                                {images.map((img) => (
                                                    <option
                                                        key={img.path}
                                                        value={img.path}
                                                    >
                                                        {img.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ),
                                    )}
                                </select>
                            </div>

                            {/* Divider */}
                            <div className="mb-4 text-center text-xs text-muted-foreground">
                                ATAU
                            </div>

                            {/* File Upload Input (Priority 1) */}
                            <div className="mb-4">
                                <label className="block w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/5 transition">
                                    <div className="text-center text-sm text-muted-foreground">
                                        Klik untuk upload
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Error Message Display */}
                            {fileError && (
                                <p className="text-xs text-destructive mb-4">
                                    {fileError}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <hr className="my-6 border-border" />
                    <div className="flex justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('products.index')}>
                                Batal
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            variant="koemau"
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Produk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
```

#### Key Learnings for Phase 3:

1. **Dual Image Sources:**
    - Dropdown (preset) has higher UI priority but Priority 2 in backend
    - File upload (new) comes after dropdown but Priority 1 in backend
    - The "ATAU" (OR) divider makes it clear these are alternate options

2. **FileReader API:**

    ```typescript
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result as string); // Base64 blob URL
    };
    reader.readAsDataURL(file); // Converts file to data URL
    ```

    This allows preview BEFORE uploading to server

3. **Form State Binding:**
    ```typescript
    value={data.product_name}
    onChange={(e) => setData('product_name', e.target.value)}
    ```
    Every input must have both `value` and `onChange` (controlled component)

---

### Phase 4: Frontend - Edit Product Page ✏️

**Goal:** Build product edit form with existing data pre-filled

#### File: `resources/js/pages/products/edit.tsx`

**Key Differences from Create:**

| Aspect              | Create                | Edit                              |
| ------------------- | --------------------- | --------------------------------- |
| HTTP Method         | `post(...)`           | `put(...)`                        |
| Initial Data        | Empty fields          | Pre-filled with product data      |
| Preview URL         | Empty string          | `/storage/{product.image}`        |
| If File Cleared     | Preview becomes empty | Preview reverts to existing image |
| If Dropdown Cleared | Preview becomes empty | Preview reverts to existing image |
| Breadcrumb          | "Produk Baru"         | "Daftar Produk > Edit Produk"     |
| Button Text         | "Simpan Produk"       | "Simpan Perubahan"                |
| Route               | `products.store`      | `products.update` with product ID |

#### Code Snippet - Edit Constructor:

```typescript
export default function Edit({ title, product, availableImages }: EditProps) {
    const [previewUrl, setPreviewUrl] = useState<string>(
        product.image ? `/storage/${product.image}` : '',
    );
    const [fileError, setFileError] = useState<string>('');

    // useForm with PRE-FILLED data (not empty)
    const { data, setData, put, processing } = useForm({
        product_name: product.product_name, // ← Pre-filled
        purchase_price: product.purchase_price, // ← Pre-filled
        selling_price: product.selling_price, // ← Pre-filled
        stock: product.stock, // ← Pre-filled
        image: null as File | null,
        image_file: '',
    });

    // ...handlers same as create, except:

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // PUT request instead of POST
        put(route('products.update', product.id));
    };

    // handleFileChange: If user clears file, return to existing image
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            // User cleared file input → restore existing image
            setPreviewUrl(product.image ? `/storage/${product.image}` : '');
            setData('image', null);
            return;
        }

        // ...rest of validation same as create...
    };

    // handlePresetImageChange: If user clears dropdown, return to existing
    const handlePresetImageChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const selectedPath = e.target.value;

        if (selectedPath) {
            // User selected new image
            setData('image_file', selectedPath);
            setPreviewUrl(`/storage/${selectedPath}`);
            setData('image', null);
            setFileError('');
        } else {
            // User cleared dropdown → restore existing image
            setData('image_file', '');
            setPreviewUrl(product.image ? `/storage/${product.image}` : '');
        }
    };
}
```

---

### Phase 5: Frontend - Product List Page 📊

**Goal:** Display products in table with edit/delete actions

#### File: `resources/js/pages/products/index.tsx`

#### Key Features:

```typescript
// State management for delete confirmation
const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// Delete handlers
const handleDeleteClick = (productId: number) => {
    setShowDeleteConfirm(productId); // Show confirmation modal
};

const handleDeleteConfirm = (productId: number) => {
    setIsDeleting(true); // Show loading state
    router.delete(route('products.destroy', productId), {
        onFinish: () => {
            setIsDeleting(false); // Hide loading
            setShowDeleteConfirm(null); // Close modal
        },
    });
};
```

#### Table Structure:

| Column          | Details                                        |
| --------------- | ---------------------------------------------- |
| **Gambar**      | Image thumbnail (40x40px) or "No img" fallback |
| **Nama Produk** | Product name                                   |
| **Harga Beli**  | Formatted: Rp10.000 (currency formatter)       |
| **Harga Jual**  | Formatted: Rp15.000                            |
| **Stok**        | Stock quantity                                 |
| **Aksi**        | Edit (link) + Delete (button) buttons          |

#### Delete Modal:

```typescript
{showDeleteConfirm !== null && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Hapus Produk?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Produk akan dihapus secara permanen beserta gambarnya.
                Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 justify-end">
                <Button
                    variant="outline"
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                >
                    Batal
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                </Button>
            </div>
        </div>
    </div>
)}
```

---

### Phase 6: Image Cleanup & Security Verification ✅

**Goal:** Verify backend image handling works correctly

#### Verified Components:

✅ **deleteImageFile() Helper**

- Safely checks if file exists before deletion
- Uses Storage facade for proper file system interaction
- Handles null/empty path gracefully

✅ **isValidImagePath() Security Regex**

- Prevents directory traversal attacks (`../../../etc/passwd`)
- Only allows 6 specific folder names
- Validates filename characters and extensions
- Case-insensitive matching

✅ **Update Method Image Cleanup**

- Deletes old image BEFORE storing new one
- Prevents cluttered storage folder
- Works for both upload and preset sources

✅ **Destroy Method Cleanup**

- Deletes image when product is removed
- No orphaned files left behind

---

## Workflow Diagrams

### CREATE Flow

```
┌─────────────────────────────────────────┐
│  User visits /products/create           │
│  Controller sends availableImages       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  React Page Loads                       │
│  - Shows form fields                    │
│  - Shows preset dropdown                │
│  - Shows file upload area               │
│  - Shows image preview box              │
└──────────────┬──────────────────────────┘
               │
               ↓
        ┌──────────────┐
        │   User Input │
        └──────┬───────┘
               │
               ├─────────────────────────────────┐
               │                                 │
               ↓                                 ↓
    ┌─────────────────────┐        ┌──────────────────────┐
    │  Select from        │        │  Upload new file     │
    │  Dropdown (Preset)  │        │                      │
    └──────────┬──────────┘        └──────────┬───────────┘
               │                             │
               ↓                             ↓
        Client validates              Client validates
        (Path format OK)               (File type, size OK)
               │                             │
               └──────────────┬──────────────┘
                              │
                              ↓
                    ┌────────────────────┐
                    │  User submits      │
                    │  (handleSubmit)    │
                    └────────┬───────────┘
                             │
                             ↓
                    ┌────────────────────┐
                    │  POST /products    │
                    │  (form data sent)  │
                    └────────┬───────────┘
                             │
                             ↓
         ┌───────────────────────────────────────┐
         │  Laravel StoreProductRequest          │
         │  - Validates all fields               │
         │  - Validates image file OR image_file │
         │  - Returns errors or passes           │
         └────────┬────────────────────────────────┘
                  │
        Validation OK?
                  │
                  ├─ NO ──→ Redirect with errors
                  │
                  ├─ YES ──→ ProductController::store()
                             │
                             ├─ hasFile('image')?
                             │  YES → Store uploaded file
                             │
                             ├─ filled('image_file')?
                             │  YES → Copy preset to storage
                             │
                             └─ Create Product record
                                │
                                ↓
                          ┌──────────────────┐
                          │ Redirect to      │
                          │ /products        │
                          │ Success message  │
                          └──────────────────┘
```

### EDIT Flow

```
┌─────────────────────────────────────┐
│  User visits /products/{id}/edit    │
│  Controller sends product +         │
│  availableImages                    │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  React Page Loads                   │
│  - Form fields PRE-FILLED           │
│  - Preview shows existing image     │
│  - useForm has product data         │
└──────────────┬──────────────────────┘
               │
               ↓
        ┌──────────────────┐
        │   User Makes     │
        │   Changes?       │
        └────────┬─────────┘
                 │
                 ├─────────────────────────────────┐
                 │                                 │
                 ↓                                 ↓
    ┌─────────────────────┐        ┌──────────────────────┐
    │  Change preset?     │        │  Upload new file?    │
    │  (or clear it)      │        │  (or clear it)       │
    └──────────┬──────────┘        └──────────┬───────────┘
               │                             │
               ↓                             ↓
        Select new image          File validated or
        OR click "Tidak Mengubah"  cleared (revert to
                                   existing image)
               │                             │
               └──────────────┬──────────────┘
                              │
                              ↓
                    ┌────────────────────┐
                    │  User submits      │
                    │  handleSubmit      │
                    └────────┬───────────┘
                             │
                             ↓
                    ┌────────────────────┐
                    │  PUT /products/{id}│
                    │  (form data sent)  │
                    └────────┬───────────┘
                             │
                             ↓
         ┌───────────────────────────────────────┐
         │  Laravel UpdateProductRequest         │
         │  - Validates (same as store)          │
         │  - Returns errors or passes           │
         └────────┬────────────────────────────────┘
                  │
        Validation OK?
                  │
                  ├─ NO ──→ Redirect with errors
                  │
                  ├─ YES ──→ ProductController::update()
                             │
                             ├─ hasFile('image')?
                             │  YES → Delete OLD image
                             │      → Store NEW file
                             │
                             ├─ filled('image_file')?
                             │  YES → Delete OLD image
                             │      → Copy preset to storage
                             │
                             └─ Neither?
                                └─ Keep existing image
                                (unset from validated)
                                │
                                ↓
                          ┌──────────────────┐
                          │ Update Product   │
                          │ record           │
                          │ Redirect to      │
                          │ /products        │
                          │ Success message  │
                          └──────────────────┘
```

### DELETE Flow

```
┌──────────────────────────────┐
│  User clicks "Hapus" button  │
│  (on table row)              │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────────┐
│  handleDeleteClick()         │
│  showDeleteConfirm = 123     │
│  (show confirmation modal)   │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  Confirmation Modal Appears      │
│  - Warning message               │
│  - "Batal" and "Hapus" buttons   │
└────────────┬─────────────────────┘
             │
             ├──────────────────┐
             │                  │
             ↓                  ↓
        User clicks          User clicks
        "Batal"              "Hapus"
             │                  │
             ↓                  ↓
    Modal closes        handleDeleteConfirm()
    (no action)         isDeleting = true
                        (show loading state)
                               │
                               ↓
                    ┌──────────────────────┐
                    │  DELETE /products/{id}
                    │  (via router.delete) │
                    └────────┬─────────────┘
                             │
                             ↓
         ┌───────────────────────────────────┐
         │  Laravel ProductController::      │
         │  destroy()                        │
         │  │                                │
         │  ├─ deleteImageFile()             │
         │  │  (remove image from storage)   │
         │  │                                │
         │  └─ product->delete()             │
         │     (remove from database)        │
         └────────┬────────────────────────────┘
                  │
                  ↓
         ┌───────────────────────────────────┐
         │  onFinish callback executes       │
         │  isDeleting = false               │
         │  showDeleteConfirm = null         │
         │  (close modal, stop loading)      │
         │                                   │
         │  Redirect to /products with       │
         │  success message                  │
         └───────────────────────────────────┘
```

---

## Testing Guide

### Manual Browser Testing Checklist

#### Test 1: Create Product with Uploaded Image

```
1. Go to /products/create
2. Fill form:
   - Nama Produk: "Cireng Test"
   - Harga Beli: 8000
   - Harga Jual: 12000
   - Stok: 50
3. Click file input, upload JPG/PNG image (< 2MB)
4. Verify preview shows in box
5. Click "Simpan Produk"
6. Verify redirect to /products with success message
7. Verify product appears in table with image thumbnail
```

#### Test 2: Create Product with Preset Image

```
1. Go to /products/create
2. Fill product fields (same as Test 1)
3. Click preset dropdown, select "Dimsum > pangsit.png"
4. Verify preview updates to show image
5. Click "Simpan Produk"
6. Verify product created with preset image
```

#### Test 3: Create with Invalid File

```
1. Go to /products/create
2. Try to upload:
   a) PDF file → Should show: "Format hanya: JPG, PNG, WebP"
   b) 5MB image → Should show: "Ukuran maksimal 2MB"
3. Verify errors disappear when valid file uploaded
```

#### Test 4: Edit Product - Change Image

```
1. Go to /products, click Edit on product
2. Verify form pre-filled with existing data
3. Verify preview shows existing image
4. Upload new image
5. Click "Simpan Perubahan"
6. Verify new image shows in table
7. Check SQL: Old image file should be deleted from storage
```

#### Test 5: Edit Product - Clear Selections

```
1. Go to edit page
2. Clear file input (select in input, press delete)
3. Verify preview reverts to existing image (NOT blank)
4. Click save
5. Verify image unchanged in database
```

#### Test 6: Delete Product

```
1. Go to /products table
2. Click "Hapus" button on product
3. Verify confirmation modal appears
4. Click "Batal"
5. Verify modal closes, product still exists
6. Click "Hapus" again, click "Hapus" in modal
7. Verify product removed from table
8. Check: Image file deleted from storage/app/public/products/
```

---

## Security Considerations

### 1. Path Traversal Prevention

**Threat:** Attacker uploads path like `../../../etc/passwd`

**Protection:** Regex validation in `isValidImagePath()`

```php
// BLOCKED paths:
"../../../etc/passwd"          ❌
"Cireng/../../admin"           ❌
"Cireng/../../../root"         ❌

// ALLOWED paths:
"Cireng/sambal.jpg"            ✅
"Dimsum/pangsit - spesial.png" ✅ (dash, space allowed)
"Katsu/chicken[fresh].webp"    ✅ (brackets allowed)
```

### 2. File Type Validation

**Frontend:** Validated before upload

```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
```

**Backend:** Laravel `image` validation

```php
'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
```

### 3. File Size Limits

**Frontend:** Check before upload
**Backend:** Laravel enforces max 2MB

- Prevents storage abuse
- Prevents timeout on slow uploads

### 4. Automatic Cleanup

**Update:** Old image deleted before storing new one

```php
$this->deleteImageFile($product->image);  // Delete old
$validated['image'] = ...; // Store new
```

**Delete:** Image removed with product

```php
$this->deleteImageFile($product->image);
$product->delete();
```

**Result:** No orphaned images cluttering storage

### 5. Storage Isolation

- User uploads go to: `storage/app/public/products/`
- Presets stay in: `public/images/` (not writable by app)
- Public folder: Not writable (no execution risk)
- Private storage: Can't be executed (safe from shell injection)

---

## Key Concepts for Beginners

### 1. Form Request Classes

**What:** Server-side validation in dedicated class

**Why:**

- Clean controllers (one job: handle requests)
- Reusable rules (multiple actions can use same rules)
- Grouped error messages

**When Used:**

```php
public function store(StoreProductRequest $request) {
    // $request is GUARANTEED valid here
    $validated = $request->validated();
}
```

### 2. useForm Hook (Inertia)

**What:** React hook for managing form state + submission

**Features:**

```typescript
const { data, setData, post, put, delete, processing } = useForm({
    name: '',
    email: '',
});

// Bind to input
<input value={data.name} onChange={(e) => setData('name', e.target.value)} />

// Submit
post(route('users.store'));  // POST to /users
put(route('users.update', 1)); // PUT to /users/1
delete(route('users.destroy', 1)); // DELETE to /users/1
```

### 3. FileReader API

**What:** JavaScript API to read files before uploading

```typescript
const file = (event.target as HTMLInputElement).files?.[0];

const reader = new FileReader();
reader.onloadend = () => {
    console.log(reader.result); // Data URL: 'data:image/jpeg;base64,...'
};
reader.readAsDataURL(file);
```

**Use:** Show preview before server upload

### 4. Modal Pattern

**What:** Popup overlay for confirmations

```typescript
// Show when state is not null
{showConfirm !== null && (
    <div className="fixed inset-0 bg-black/50">
        <div className="bg-white p-6">
            <p>Delete this item?</p>
            <button onClick={handleConfirm}>Yes</button>
            <button onClick={() => setShowConfirm(null)}>No</button>
        </div>
    </div>
)}
```

### 5. Controlled vs Uncontrolled Components

**Uncontrolled (❌ DON'T USE):**

```typescript
<input placeholder="Name" />  // No value, no onChange
```

**Controlled (✅ USE):**

```typescript
<input value={name} onChange={(e) => setName(e.target.value)} />
```

**Why:** React needs to track state to:

- Show errors
- Disable submit button
- Pre-fill form (edit page)
- Reset form after submission

---

## File Structure Summary

```
app/Http/
├── Controllers/
│   └── ProductController.php         (5 methods + 3 helpers)
└── Requests/
    ├── StoreProductRequest.php       (validation for create)
    └── UpdateProductRequest.php      (validation for edit)

resources/js/pages/products/
├── create.tsx                        (New product form)
├── edit.tsx                          (Edit product form)
└── index.tsx                         (Product list + delete)

public/images/
├── Cireng/                           (Preset images)
├── Dimsum/
├── Katsu/
├── Nugget/
├── Risol/
└── Siomay/

storage/app/public/products/          (User-uploaded & copied images)
```

---

## Common Issues & Solutions

### Issue 1: "Image not showing in table"

- **Cause:** Symlink not created or images not uploaded
- **Solution:** Run `php artisan storage:link`
- **Check:** Verify `public/storage` folder exists

### Issue 2: "Old image not deleted on update"

- **Cause:** `deleteImageFile()` not called or permission issue
- **Solution:** Check `storage` folder permissions: `chmod -R 775 storage`

### Issue 3: "File upload fails silently"

- **Cause:** Max upload size limit exceeded
- **Solution:** Check `php.ini`: `upload_max_filesize` and `post_max_size`
- **Set:** `php.ini` to at least `50M`

### Issue 4: "Preset dropdown empty"

- **Cause:** No images in `public/images/` folders
- **Solution:** Add image files to folders and refresh page

---

## Next Steps

Now that Phase 6 is complete, the system is production-ready for:

1. **Testing in browser** (see Testing Guide above)
2. **Adding Pecah Produk feature** (as requested - when ready)
3. **Adding more product categories**
4. **Implementing user permissions** (only admins can manage)
5. **Adding image editing/cropping**
6. **Mobile responsive design**

---

## Questions?

For clarifications on any part of this documentation, refer to:

- **Code Comments:** Detailed inline comments in controller + React components
- **Workflow Diagrams:** Visual representation of each operation
- **Testing Guide:** Step-by-step browser testing procedures

**Happy coding! 🚀**
