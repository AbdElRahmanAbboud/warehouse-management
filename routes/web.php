<?php

use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\ItemController;
use App\Http\Controllers\Dashboard\ProductTypeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::redirect('/', '/login');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::apiResource('product-types', ProductTypeController::class)->except('show');

    Route::post('items/{item}/toggle-sold', [ItemController::class, 'toggleSold'])->name('items.toggle-sold');
    Route::apiResource('items', ItemController::class)->except('show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
