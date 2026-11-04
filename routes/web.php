<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\AssignedUserController;
use App\Http\Controllers\SystemDataController;
use App\Http\Controllers\HardwareController;
use App\Http\Controllers\AuthController;
use Inertia\Inertia;

//Guest Middleware Route Group

Route::middleware('guest')->group(function () {

    Route::get('/', function() {
        return redirect()->route('login');
    });

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');

    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

});


//Auth Middleware Route Group

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/documentation', function() {
        return Inertia::render('Documentation');
    });
    
    Route::get('/about', function() {
        return Inertia::render('About');
    });

    Route::resource('branches', BranchController::class);
    Route::resource('regions', RegionController::class);
    Route::resource('users', AssignedUserController::class);
    Route::resource('hardwares', HardwareController::class);

    Route::get('/report/{hardware}' , [HardwareController::class,'report']);

    // System Data Route Group
    Route::resource('system-data', SystemDataController::class);
    Route::get('/system-data/create/{type}', [SystemDataController::class, 'create']);
    Route::post('/system-data/{type}', [SystemDataController::class, 'store']);
    Route::get('/system-data/{type}/{id}/edit', [SystemDataController::class, 'edit'])->name('system-data.edit');
    Route::put('/system-data/{type}/{id}', [SystemDataController::class, 'update']);
    Route::delete('/system-data/{itemType}/{id}', [SystemDataController::class, 'destroy']);

});
