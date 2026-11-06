<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\SystemDataController;
use App\Http\Controllers\HardwareController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DeletedHardwareController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\MyHardwareController;
use App\Http\Controllers\VerificationController;
use Inertia\Inertia;

//Guest Middleware Route Group

Route::middleware('guest')->group(function () {

    Route::get('/', function() {
        return redirect()->route('login');
    });

    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');

    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::get('/invitation/{token}', [InvitationController::class, 'show'])->name('invitation.show');
    Route::post('/invitation/{token}', [InvitationController::class, 'accept'])->name('invitation.accept');

});


//Auth Middleware Route Group

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::put('/onboarding', [OnboardingController::class, 'update'])->name('onboarding.update');
    Route::get('/my-hardware', [MyHardwareController::class, 'index'])->name('my-hardware.index');
    Route::post('/my-hardware', [MyHardwareController::class, 'store'])->name('my-hardware.store');
    Route::get('/verification', [VerificationController::class, 'index'])->name('verification.index');
    Route::put('/verification/{hardware}', [VerificationController::class, 'update'])->name('verification.update');

    Route::get('/settings/password', [AuthController::class, 'showChangePassword'])->name('settings.password.show');
    Route::put('/settings/password', [AuthController::class, 'updatePassword'])->name('settings.password.update');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/documentation', function() {
        return Inertia::render('Documentation');
    });
    
    Route::get('/about', function() {
        return Inertia::render('About');
    });

    Route::resource('branches', BranchController::class);
    Route::resource('regions', RegionController::class);
    Route::resource('hardwares', HardwareController::class);

    Route::get('/report/{hardware}' , [HardwareController::class,'report']);

    // System Data Route Group
    Route::resource('system-data', SystemDataController::class);
    Route::get('/system-data/create/{type}', [SystemDataController::class, 'create']);
    Route::post('/system-data/{type}', [SystemDataController::class, 'store']);
    Route::get('/system-data/{type}/{id}/edit', [SystemDataController::class, 'edit'])->name('system-data.edit');
    Route::put('/system-data/{type}/{id}', [SystemDataController::class, 'update']);
    Route::delete('/system-data/{itemType}/{id}', [SystemDataController::class, 'destroy']);

    Route::get('/admin/deleted-hardware', [DeletedHardwareController::class, 'index'])->name('admin.deleted-hardware.index');
    Route::post('/admin/deleted-hardware/{hardware}/restore', [DeletedHardwareController::class, 'restore'])->withTrashed()->name('admin.deleted-hardware.restore');
    Route::delete('/admin/deleted-hardware', [DeletedHardwareController::class, 'destroy'])->name('admin.deleted-hardware.destroy');

    // Superadmin: role & permission management
    Route::get('/admin/roles', [RoleController::class, 'index'])->name('admin.roles.index');
    Route::post('/admin/roles', [RoleController::class, 'store'])->name('admin.roles.store');
    Route::get('/admin/roles/{role}', [RoleController::class, 'show'])->name('admin.roles.show');
    Route::put('/admin/roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
    Route::delete('/admin/roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
    Route::redirect('/users', '/admin/users');
    Route::get('/admin/users', [RoleController::class, 'users'])->name('admin.users.index');
    Route::put('/admin/users/{user}/role', [RoleController::class, 'assignUser'])->name('admin.users.role');
    Route::post('/admin/invitations', [InvitationController::class, 'store'])->name('admin.invitations.store');

});
