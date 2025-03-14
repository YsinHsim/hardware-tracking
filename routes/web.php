<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstateController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\AssignedUserController;
use App\Http\Controllers\SystemDataController;
use App\Http\Controllers\HardwareController;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth;
use App\Http\Middleware\AuthSession;
use Inertia\Inertia;

/*
Route::get('/', function() {
    return Inertia::render('Welcome');
});
*/

Route::get('/', function() {
    return redirect()->route('login');
});

Route::get('/login', [Auth::class, 'index'])->name('login');

Route::post('/login', function (Request $request) {
    $request->validate([
        'password' => 'required',
    ]);

    if ($request->password === 'abc_123') {
        session(['logged_in' => true]);
        return redirect()->intended('/estates');
    }

    return back()->withErrors(['password' => 'Incorrect password.']);
});

Route::middleware(AuthSession::class)->group(function () {
    Route::post('/logout', function () {
        session()->flush();
        return redirect()->route('login');
    });

    Route::get('/documentation', function() {
        return Inertia::render('Documentation');
    });
    
    Route::get('/about', function() {
        return Inertia::render('About');
    });

    Route::resource('estates', EstateController::class);
    Route::resource('regions', RegionController::class);
    Route::resource('users', AssignedUserController::class);
    Route::resource('hardwares', HardwareController::class);

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
});





