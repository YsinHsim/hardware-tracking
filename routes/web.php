<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstateController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\AssignedUserController;
use App\Http\Controllers\SystemDataController;
use App\Http\Controllers\HardwareController;
use Inertia\Inertia;


Route::get('/', function() {
    return Inertia::render('Welcome');
});


Route::resource('estates', EstateController::class);
Route::resource('regions', RegionController::class);
Route::resource('users', AssignedUserController::class);
Route::resource('hardwares', HardwareController::class);


// System Data Route Group
// =======================
Route::resource('system-data', SystemDataController::class);
Route::get('/system-data/create/{type}', [SystemDataController::class, 'create']);
Route::post('/system-data/{type}', [SystemDataController::class, 'store']);
Route::get('/system-data/{type}/{id}/edit', [SystemDataController::class, 'edit'])->name('system-data.edit');
Route::put('/system-data/{type}/{id}', [SystemDataController::class, 'update']);
Route::delete('/system-data/{itemType}/{id}', [SystemDataController::class, 'destroy']);
// =======================


