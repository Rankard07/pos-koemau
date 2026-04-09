<?php

use App\Models\Expense;
use App\Models\Income;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Supply;
use App\Models\User;


it('creates supply and expense automatically when buying product from products create flow', function () {
    /** @var Tests\TestCase $this */
    $user = User::factory()->create();
    assert($user instanceof User);
    $this->actingAs($user);

    $payload = [
        'product_name' => 'Dimsum Auto Flow',
        'purchase_price' => 12000,
        'selling_price' => 18000,
        'stock' => 15,
    ];

    $this->post(route('products.store'), $payload)
        ->assertRedirect(route('products.index'));

    $product = Product::query()->where('product_name', 'Dimsum Auto Flow')->first();

    expect($product)->not->toBeNull();

    $expectedTotal = $payload['purchase_price'] * $payload['stock'];

    $this->assertDatabaseHas('supplies', [
        'product_id' => $product->id,
        'supplier_name' => 'Input Produk',
        'quantity' => $payload['stock'],
        'purchase_price' => $payload['purchase_price'],
        'total_amount' => $expectedTotal,
        'note' => 'Auto dari + Beli Produk',
    ]);

    $this->assertDatabaseHas('expenses', [
        'description' => "Supply awal {$payload['product_name']} dari + Beli Produk",
        'amount' => $expectedTotal,
        'category' => 'pembelian_stok',
    ]);

    expect(Supply::query()->count())->toBe(1)
        ->and(Expense::query()->count())->toBe(1);
});

/**
 * @test
 */
it('creates income and decreases stock on sales checkout', function () {
    /** @var Tests\TestCase $this */
    $user = User::factory()->create();
    assert($user instanceof User);
    $this->actingAs($user);

    $product = Product::query()->create([
        'product_name' => 'Katsu Sales Flow',
        'purchase_price' => 10000,
        'selling_price' => 25000,
        'stock' => 10,
    ]);

    $this->post(route('sales.store'), [
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
            ],
        ],
        'note' => 'Checkout test',
    ])->assertRedirect(route('sales.index'));

    $sale = Sale::query()->latest('id')->first();

    expect($sale)->not->toBeNull()
        ->and((float) $sale->total_amount)->toBe(50000.0);

    $product->refresh();

    expect($product->stock)->toBe(8);

    $this->assertDatabaseHas('incomes', [
        'sale_id' => $sale->id,
        'description' => "Penjualan #{$sale->id}",
        'amount' => 50000,
        'source' => 'penjualan',
    ]);

    expect(Income::query()->count())->toBe(1);
});

/**
 * @test
 */
it('can delete product that only has auto supply from buy product flow', function () {
    /** @var Tests\TestCase $this */
    $user = User::factory()->create();
    assert($user instanceof User);
    $this->actingAs($user);

    $product = Product::query()->create([
        'product_name' => 'Produk Hapus Auto Supply',
        'purchase_price' => 9000,
        'selling_price' => 15000,
        'stock' => 7,
    ]);

    Supply::query()->create([
        'supplier_name' => 'Input Produk',
        'product_id' => $product->id,
        'quantity' => 7,
        'purchase_price' => 9000,
        'total_amount' => 63000,
        'supply_date' => now()->toDateString(),
        'note' => 'Auto dari + Beli Produk',
    ]);

    $this->delete(route('products.destroy', $product))
        ->assertRedirect(route('products.index'));

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
    $this->assertDatabaseMissing('supplies', ['product_id' => $product->id, 'note' => 'Auto dari + Beli Produk']);
});
