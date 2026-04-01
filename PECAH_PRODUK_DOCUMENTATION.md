# 📚 Pecah Produk (Product Split) Feature - Complete Documentation

## Pendahuluan

Dokumen ini menjelaskan implementasi lengkap fitur **Pecah Produk** yang memungkinkan user untuk memecah 1 produk induk menjadi multiple produk hasil dengan harga berbeda dalam 1 transaksi. Fitur ini adalah **pure inventory movement** — hanya mengubah level stok produk, bukan transaksi penjualan.

**Dibuat untuk**: Koemau POS - Laravel 12 + Inertia React
**Tanggal**: April 1, 2026
**Status**: Phase 1 & Phase 2 Completed (Database + Backend)

---

## 📊 Phase 1 & 2: Database & Backend (COMPLETED)

### Phase 1: Database Schema & Models

#### 📋 Database Tables

**Table: `product_splits`** (Parent Transaction)

```
id (PK)                    → Unique identifier
product_id_from (FK)       → Foreign key to products (produk induk yang dipecah)
note (TEXT, nullable)      → Optional keterangan/catatan tentang split
created_at                 → Timestamp saat split dibuat
updated_at                 → Timestamp saat split diupdate
```

**Contoh data di table**:

```
| id | product_id_from | note                  | created_at          | updated_at          |
|----|-----------------|----------------------|---------------------|---------------------|
| 1  | 1               | 1 pack isi 100→2 50  | 2026-04-01 10:30:00 | 2026-04-01 10:30:00 |
| 2  | 2               | Pecah menjadi 4 item | 2026-04-01 11:15:00 | 2026-04-01 11:15:00 |
```

**Table: `product_split_items`** (Result Products)

```
id (PK)                    → Unique identifier
product_split_id (FK)      → Foreign key to product_splits
product_id_to (FK)         → Foreign key to products (produk hasil)
quantity (INT)             → Jumlah unit dari produk hasil
selling_price (DECIMAL)    → Harga jual hasil saat split (snapshot untuk audit trail)
created_at                 → Timestamp
updated_at                 → Timestamp
```

**Contoh data di table**:

```
| id | product_split_id | product_id_to | quantity | selling_price |
|----|------------------|---------------|----------|---------------|
| 1  | 1                | 2             | 2        | 105000        |
| 2  | 1                | 3             | 2        | 55000         |
| 3  | 1                | 4             | 1        | 55000         |
| 4  | 2                | 5             | 4        | 75000         |
```

#### 🔗 Model Relationships

**ProductSplit Model** (`app/Models/ProductSplit.php`)

```php
// Relationship 1: Produk induk yang dipecah
public function parentProduct(): BelongsTo {
    return $this->belongsTo(Product::class, 'product_id_from');
}

// Relationship 2: Semua item hasil dari split ini
public function splitItems(): HasMany {
    return $this->hasMany(ProductSplitItem::class);
}

// Usage:
$split = ProductSplit::find(1);
$split->parentProduct;    // Produk induk (Dimsum 100)
$split->splitItems;       // Array of hasil (Dimsum 50, 25, dll)
```

**ProductSplitItem Model** (`app/Models/ProductSplitItem.php`)

```php
// Relationship 1: Parent split transaction
public function productSplit(): BelongsTo {
    return $this->belongsTo(ProductSplit::class);
}

// Relationship 2: Produk hasil
public function resultProduct(): BelongsTo {
    return $this->belongsTo(Product::class, 'product_id_to');
}

// Usage:
$item = ProductSplitItem::find(1);
$item->productSplit;     // Parent split record
$item->resultProduct;    // Produk hasil (Dimsum 50)
```

**Product Model** (`app/Models/Product.php`) - Updated

```php
// Relationship 1: Splits dimana produk ini adalah parent
public function productSplitsAsParent(): HasMany {
    return $this->hasMany(ProductSplit::class, 'product_id_from');
}

// Relationship 2: Splits dimana produk ini adalah hasil
public function productSplitItemsAsResult(): HasMany {
    return $this->hasMany(ProductSplitItem::class, 'product_id_to');
}

// Usage:
$product = Product::find(1);  // Dimsum 100
$product->productSplitsAsParent;      // Splits dimana Dimsum 100 dipecah
$product->productSplitItemsAsResult;  // Splits dimana produk ini adalah hasil
```

---

### Phase 2: Backend Validation & Controller

#### 🔐 Form Validation: `StoreProductSplitRequest`

**File**: `app/Http/Requests/StoreProductSplitRequest.php`

**Validation Rules** (Field-level):

```php
'product_id_from' => [
    'required',                    // Harus ada produk induk
    'integer',                     // Harus angka
    'exists:products,id',          // Produk harus exist di database
]

'split_items' => [
    'required',                    // Harus ada minimal 1 item hasil
    'array',                       // Harus array (bisa multiple)
    'min:1',                       // Minimal 1 item
]

'split_items.*.product_id_to' => [
    'required',                    // Setiap item harus punya produk hasil
    'integer',
    'exists:products,id',
    Rule::notIn([$this->input('product_id_from')]),  // Hasil ≠ induk
]

'split_items.*.quantity' => [
    'required',
    'integer',
    'min:1',                       // Qty minimal 1
]

'split_items.*.selling_price' => [
    'required',
    'numeric',
    'min:0',
]
```

**Validation Rules** (Custom/Business Logic):

```php
// Di withValidator():
- Ambil produk induk dari database
- Hitung total quantity dari semua split items
- VALIDASI: parent stock >= total split qty
- REJECT jika stok tidak cukup dengan pesan deskriptif

// Pesan error:
"Stok produk induk (Dimsum 100) hanya tersisa 5 unit,
 namun Anda mencoba memecah 10 unit."
```

**Error Messages** (Indonesian):

- Produk induk harus dipilih
- Produk induk tidak ditemukan
- Minimal harus ada 1 produk hasil
- Produk hasil tidak boleh sama dengan produk induk
- Stok produk induk tidak cukup
- dll...

---

#### 🎛️ Controller: `ProductSplitController`

**File**: `app/Http/Controllers/ProductSplitController.php`

**Method 1: `index()`** - List semua splits (History)

```
Route:  GET /produk-split
Status: Requires auth + verified middleware

Process:
1. Query ProductSplit dengan eager load: parentProduct, splitItems.resultProduct
2. Sort by created_at DESC (terbaru duluan)
3. Paginate (15 per halaman)
4. Format data untuk display:
   - Tanggal: formatted date/time
   - Produk induk: nama
   - Stok berkurang: qty yang dikurangi
   - Produk hasil: list names
   - Stok bertambah: total hasil qty
   - Keterangan: note atau '-'

Return: Inertia view 'produk-split/Index' + formatted splits data
```

**Method 2: `create()`** - Show create form

```
Route:  GET /produk-split/create
Status: Requires auth + verified middleware

Process:
1. Fetch semua produk dengan:
   - Columns: id, product_name, stock, selling_price
   - Condition: stock > 0 (hanya produk yang punya stok)
2. Return: Inertia view 'produk-split/Create' + products array

Used for: Populate dropdown di form
```

**Method 3: `store()`** - Simpan split transaction

```
Route:  POST /produk-split
Status: Requires auth + verified middleware
Input:  StoreProductSplitRequest (validated)

Flow:
1. Validate input via StoreProductSplitRequest
2. BEGIN DATABASE TRANSACTION (atomicity)
3. Create ProductSplit record dengan:
   - product_id_from: dari request
   - note: dari request (nullable)
4. LOOP untuk setiap split_item:
   a. Create ProductSplitItem dengan:
      - product_split_id: ID baru
      - product_id_to: dari request
      - quantity: dari request
      - selling_price: dari request (snapshot)
   b. Increment stock result product: +quantity
5. Decrement stock parent product: -total_qty
6. COMMIT transaction
7. Return: Redirect ke show page dengan success message

ERROR Handling:
- Jika ada error: ROLLBACK semua changes
- Return: Back dengan input + error message

Contoh Stock Update:
BEFORE:
  Dimsum 100: stock 2
  Dimsum 50:  stock 10
  Dimsum 25:  stock 5

Split: Dimsum 100 (qty: 1) → [Dimsum 50 (qty: 2), Dimsum 25 (qty: 2)]

AFTER:
  Dimsum 100: stock 1  (2 - 1 = 1, total split qty)
  Dimsum 50:  stock 12 (10 + 2)
  Dimsum 25:  stock 7  (5 + 2)
```

**Method 4: `show()`** - Display split detail

```
Route:  GET /produk-split/{productSplit}
Status: Requires auth + verified middleware
Param:  ProductSplit model (auto-resolved via implicit binding)

Process:
1. Eager load: parentProduct, splitItems.resultProduct
2. Format data untuk detail page:
   - ID split
   - Tanggal + waktu + relative time
   - Parent product: name, price, qty berkurang, image
   - Result products array: each dengan name, price, qty, image
   - Note

3. Build stock summary table:
   - Parent product: stok_awal, perubahan (-qty), stok_akhir
   - Each result product: stok_awal, perubahan (+qty), stok_akhir

Return: Inertia view 'produk-split/Show' + formatted data + summary
```

---

#### 📝 Business Logic & Stock Updates

**Stock Update Logic** - DB::transaction (Atomic)

```
Flow Diagram:

┌─ START TRANSACTION
│
├─ 1. Create ProductSplit record
│    └─ INSERT INTO product_splits (product_id_from, note)
│
├─ 2. Create ProductSplitItem records (per item)
│    ├─ INSERT INTO product_split_items (split_id, product_id_to, qty, price)
│    └─ UPDATE products SET stock = stock + qty WHERE id = product_id_to
│
├─ 3. Update parent product stock
│    └─ UPDATE products SET stock = stock - total_qty WHERE id = parent_id
│
└─ COMMIT TRANSACTION (or ROLLBACK if error)
```

**Validation Sequence**:

```
1. Input validation (FormRequest)
   ├─ Field-level rules (required, type, exists, etc)
   └─ Custom validation (stock check, product ≠ parent)

2. Pre-transaction checks
   ├─ Parent product exists
   ├─ Parent stock >= total split qty
   └─ All result products exist

3. Stock updates (inside transaction)
   ├─ Atomicity guaranteed
   ├─ All or nothing
   └─ Rollback on any error
```

**Why DB::transaction?**

Garantir consistency: Jika ada error di tengah proses (misalnya saat update product 2 dari 3), semua operasi akan di-rollback agar tidak ada data yang half-updated.

```php
// Tanpa transaction (DANGER):
1. Create split ✓
2. Create item 1, update product 1 ✓
3. Create item 2, ERROR! ❌
4. Product 1 stok sudah berubah, tapi split item 2 tidak jadi
   → DATA INKONSISTEN!

// Dengan transaction (SAFE):
1. Create split ✓
2. Create item 1, update product 1 ✓
3. Create item 2, ERROR! ❌
4. ROLLBACK semua (split, item 1, product update)
   → Data tetap konsisten
```

---

## 🎯 Routes Overview

**Protected Routes** (require `auth` + `verified` middleware):

```
GET    /produk-split             → ProductSplitController@index
       ├─ Name: product-split.index
       └─ Purpose: List history splits

GET    /produk-split/create      → ProductSplitController@create
       ├─ Name: product-split.create
       └─ Purpose: Show create form

POST   /produk-split             → ProductSplitController@store
       ├─ Name: product-split.store
       └─ Purpose: Save new split (validated via StoreProductSplitRequest)

GET    /produk-split/{id}        → ProductSplitController@show
       ├─ Name: product-split.show
       └─ Purpose: Show detail page
```

**Route Registration**: Ditambahkan di `routes/web.php` dalam middleware group `['auth', 'verified']`

---

## 💾 File Summary - Phase 1 & 2

| File                                                                         | Type        | Purpose                                      | Status     |
| ---------------------------------------------------------------------------- | ----------- | -------------------------------------------- | ---------- |
| `database/migrations/2026_04_01_000001_create_product_splits_table.php`      | Migration   | Create product_splits table                  | ✅ Created |
| `database/migrations/2026_04_01_000002_create_product_split_items_table.php` | Migration   | Create product_split_items table             | ✅ Created |
| `app/Models/ProductSplit.php`                                                | Model       | ProductSplit with relationships              | ✅ Created |
| `app/Models/ProductSplitItem.php`                                            | Model       | ProductSplitItem with relationships          | ✅ Created |
| `app/Models/Product.php`                                                     | Model       | Updated with split relationships             | ✅ Updated |
| `app/Http/Requests/StoreProductSplitRequest.php`                             | FormRequest | Validation for split creation                | ✅ Created |
| `app/Http/Controllers/ProductSplitController.php`                            | Controller  | 4 main methods (index, create, store, show)  | ✅ Created |
| `routes/web.php`                                                             | Routes      | 4 new routes + ProductSplitController import | ✅ Updated |

---

## 🧪 Testing Checklist - Phase 1 & 2

### Database Tests

- [ ] migrations ran successfully
- [ ] product_splits table created dengan columns yang benar
- [ ] product_split_items table created dengan columns yang benar
- [ ] Foreign keys created correctly

### Model Relationship Tests

```php
// Test: ProductSplit.parentProduct
$split = ProductSplit::find(1);
$parent = $split->parentProduct;  // Should return Product

// Test: ProductSplit.splitItems
$items = $split->splitItems;  // Should return HasMany

// Test: ProductSplitItem.resultProduct
$item = ProductSplitItem::find(1);
$result = $item->resultProduct;  // Should return Product

// Test: Product relationships
$product = Product::find(1);
$splits_as_parent = $product->productSplitsAsParent;
$splits_as_result = $product->productSplitItemsAsResult;
```

### Validation Tests

```php
// Test 1: Valid request
StoreProductSplitRequest with valid data → passes

// Test 2: Insufficient stock
parent stock: 2, split qty: 5 → validation error "stok tidak cukup"

// Test 3: Product hasil = parent
product_id_from = 1, split_items[0].product_id_to = 1 → validation error

// Test 4: Product tidak exist
product_id_from = 999 → validation error "produk tidak ditemukan"

// Test 5: No split items
split_items = [] → validation error "minimal 1 item"
```

### Controller Tests

```php
// Test: GET /produk-split/create
Response status 200
Response contains 'products' data

// Test: POST /produk-split (invalid)
validation errors returned

// Test: POST /produk-split (valid)
StatusCode 302 (redirect)
Stock updated correctly
Both parent ↓ and results ↑

// Test: GET /produk-split/{id}
Response status 200
Data formatted correctly
Stock summary calculated right
```

---

## 📖 Workflow Example: Scenario Dimsum

**Scenario**: User ingin memecah Dimsum 100 (stock: 2, harga: Rp180.000)

**Sebelum Split**:

```
Products:
- Dimsum 100: stock 2
- Dimsum 50: stock 10
- Dimsum 25: stock 5
```

**User Action** (di Frontend Create Form):

```
1. Select parent: Dimsum 100
2. Add result item 1: Dimsum 50, qty 2, price 105.000
3. Add result item 2: Dimsum 25, qty 2, price 55.000
4. Note: "Pecah 1 pack"
5. Submit
```

**Backend Processing** (store method):

```
1. Validate via StoreProductSplitRequest
   ├─ parent_id exist? YES
   ├─ all result_ids exist? YES
   ├─ qty ≠ parent? YES
   ├─ parent stock (2) >= total qty (4)? NO ❌

   ERROR! Validation fails: "Stok Dimsum 100 hanya 2, mau pecah 4"

2. User kembali ke form, lihat error
3. User ubah qty jadi 1
4. Submit lagi

5. Validate via StoreProductSplitRequest
   ├─ parent_id exist? YES
   ├─ all result_ids exist? YES
   ├─ qty ≠ parent? YES
   ├─ parent stock (2) >= total qty (3)? YES ✅

6. BEGIN TRANSACTION
7. CREATE ProductSplit:
   INSERT INTO product_splits (product_id_from, note)
   VALUES (1, 'Pecah 1 pack')
   → Returns split_id = 10

8. CREATE ProductSplitItem #1:
   INSERT INTO product_split_items (split_id, product_id_to, qty, price)
   VALUES (10, 2, 1, 105000)

9. UPDATE Dimsum 50:
   UPDATE products SET stock = stock + 1 WHERE id = 2
   → stock: 10 → 11

10. CREATE ProductSplitItem #2:
    INSERT INTO product_split_items (split_id, product_id_to, qty, price)
    VALUES (10, 3, 2, 55000)

11. UPDATE Dimsum 25:
    UPDATE products SET stock = stock + 2 WHERE id = 3
    → stock: 5 → 7

12. UPDATE Dimsum 100 (parent):
    UPDATE products SET stock = stock - 3 WHERE id = 1
    → stock: 2 → -1 ❌ WAIT ERROR!

13. ROLLBACK transaction
    All changes rolled back!

14. Show error to user
```

**Oops!** Total split qty (1 + 2 = 3) tapi Dimsum 100 hanya stock 2.

**User coba lagi** dengan qty yang benar:

```
qty Dimsum 50: 1
qty Dimsum 25: 1
Total: 2 (ok, stock ada 2)

Submit...

Store sequence sama, tapi stock check pass:
12. UPDATE Dimsum 100:
    stock: 2 → 0 ✓

13. COMMIT transaction
```

**Setelah Split (Success)**:

```
Products:
- Dimsum 100: stock 0 (2 - 2)
- Dimsum 50: stock 11 (10 + 1)
- Dimsum 25: stock 6 (5 + 1)

Database:
product_splits#10: {parent_id: 1, note: 'Pecah 1 pack', created_at: '2026-04-01 10:30'}
product_split_items#1: {split_id: 10, result_id: 2, qty: 1, price: 105000}
product_split_items#2: {split_id: 10, result_id: 3, qty: 1, price: 55000}
```

**User sees**:

- Redirect to `/produk-split/10` (detail page)
- Success message: "Dimsum 100 berhasil dipecah!"
- Detail shows: Dimsum 100 (-2), Dimsum 50 (+1), Dimsum 25 (+1)

---

## 🔄 Phase 3-6 Preview (Frontend + Integration)

**Pending Phases**:

1. Phase 3: Frontend - Create Page (React form)
2. Phase 4: Frontend - History/List Page (Table)
3. Phase 5: Frontend - Detail Page
4. Phase 6: Routes Integration + "Pecah Produk" button on product cards

---

## 📌 Key Takeaways - Phase 1 & 2

✅ **Database**: 2 tables dengan proper foreign keys + cascade delete
✅ **Models**: 3 models dengan relationships yang jelas
✅ **Validation**: Comprehensive FormRequest dengan custom rules
✅ **Controller**: 4 methods dengan DB::transaction untuk atomic operations
✅ **Routes**: 4 protected routes sesuai REST conventions
✅ **Stock Logic**: Automatic decrements parent, increments all results
✅ **Error Handling**: Rollback jika ada error, consistent data guaranteed

---

## 🚀 Next Steps

1. **Manual Testing**:

    ```bash
    php artisan tinker
    // Test creating split via create ProductSplit + items manually
    ```

2. **Pest Tests** (Optional):

    ```bash
    php artisan make:test ProductSplitTest --pest --feature
    // Write tests for validation, stock updates, etc
    ```

3. **Frontend Implementation** (Phase 3-5):
    - Create form component
    - List/history component
    - Detail view component
    - Integration with product cards

---

**Dokumentasi ini akan di-update setiap fase selesai. Terima kasih!** 🎉
