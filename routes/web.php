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
    Route::put('/my-hardware/{hardware}', [MyHardwareController::class, 'update'])->name('my-hardware.update');
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

    Route::get('/branches', [BranchController::class, 'index'])->name('branches.index')->middleware('permission:branches.view');
    Route::get('/branches/create', [BranchController::class, 'create'])->name('branches.create')->middleware('permission:branches.create');
    Route::post('/branches', [BranchController::class, 'store'])->name('branches.store')->middleware('permission:branches.create');
    Route::get('/branches/{branch}', [BranchController::class, 'show'])->name('branches.show')->middleware('permission:branches.view');
    Route::get('/branches/{branch}/edit', [BranchController::class, 'edit'])->name('branches.edit')->middleware('permission:branches.edit');
    Route::match(['put', 'patch'], '/branches/{branch}', [BranchController::class, 'update'])->name('branches.update')->middleware('permission:branches.edit');
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->name('branches.destroy')->middleware('permission:branches.delete');
    Route::resource('regions', RegionController::class)->only(['store'])->middleware('permission:branches.create');
    Route::resource('regions', RegionController::class)->only(['update'])->middleware('permission:branches.edit');
    Route::resource('regions', RegionController::class)->only(['destroy'])->middleware('permission:branches.delete');
    Route::get('/hardwares', [HardwareController::class, 'index'])->name('hardwares.index')->middleware('permission:hardware.view');
    Route::get('/hardwares/create', [HardwareController::class, 'create'])->name('hardwares.create')->middleware('permission:hardware.create');
    Route::post('/hardwares', [HardwareController::class, 'store'])->name('hardwares.store')->middleware('permission:hardware.create');
    Route::get('/hardwares/{hardware}', [HardwareController::class, 'show'])->name('hardwares.show')->middleware('permission:hardware.view');
    Route::get('/hardwares/{hardware}/edit', [HardwareController::class, 'edit'])->name('hardwares.edit')->middleware('permission:hardware.edit');
    Route::match(['put', 'patch'], '/hardwares/{hardware}', [HardwareController::class, 'update'])->name('hardwares.update')->middleware('permission:hardware.edit');
    Route::delete('/hardwares/{hardware}', [HardwareController::class, 'destroy'])->name('hardwares.destroy')->middleware('permission:hardware.delete');

    Route::get('/report/{hardware}' , [HardwareController::class,'report'])->middleware('permission:hardware.view');

    // System Data Route Group
    Route::resource('system-data', SystemDataController::class)->only(['index', 'show'])->middleware('permission:system-data.view');
    Route::resource('system-data', SystemDataController::class)->only(['store'])->middleware('permission:system-data.create');
    Route::resource('system-data', SystemDataController::class)->only(['update'])->middleware('permission:system-data.edit');
    Route::resource('system-data', SystemDataController::class)->only(['destroy'])->middleware('permission:system-data.delete');
    Route::get('/system-data/create/{type}', [SystemDataController::class, 'create'])->middleware('permission:system-data.create');
    Route::post('/system-data/{type}', [SystemDataController::class, 'store'])->middleware('permission:system-data.create');
    Route::get('/system-data/{type}/{id}/edit', [SystemDataController::class, 'edit'])->name('system-data.edit')->middleware('permission:system-data.edit');
    Route::put('/system-data/{type}/{id}', [SystemDataController::class, 'update'])->middleware('permission:system-data.edit');
    Route::delete('/system-data/{itemType}/{id}', [SystemDataController::class, 'destroy'])->middleware('permission:system-data.delete');

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
    Route::put('/admin/users/{user}/status', [RoleController::class, 'updateUserStatus'])->name('admin.users.status');
    Route::delete('/admin/users/{user}', [RoleController::class, 'destroyUser'])->name('admin.users.destroy');
    Route::post('/admin/invitations', [InvitationController::class, 'store'])->name('admin.invitations.store');

});
