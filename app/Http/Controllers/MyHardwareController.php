<?php

namespace App\Http\Controllers;

use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\User;
use App\Notifications\HardwareVerificationRequested;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MyHardwareController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('MyHardware/Index', [
            'hardware' => Hardware::where('submitted_by', $request->user()->id)
                ->with(['hardwareType', 'hardwareStatus'])->latest()->get(),
            'hardwareTypes' => HardwareType::orderBy('hardware_type_name')->get(),
            'hardwareStatuses' => HardwareStatus::orderBy('hardware_status_name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hardware_no' => ['required', 'string', 'unique:hardwares,hardware_no'],
            'hardware_serial_no' => ['required', 'string', 'max:255', 'unique:hardwares,hardware_serial_no'],
            'hardware_type_id' => ['required', 'exists:hardware_types,id'],
            'hardware_status_id' => ['required', 'exists:hardware_statuses,id'],
        ], [], [
            'hardware_serial_no' => 'serial number',
            'hardware_type_id' => 'hardware type',
            'hardware_status_id' => 'hardware status',
        ]);

        $user = $request->user();
        $hardware = Hardware::create([
            ...$validated,
            'user_id' => $user->id,
            'verification_status' => 'pending',
            'submitted_by' => $user->id,
        ]);

        User::permission('hardware.verify')->get()->each(function (User $reviewer) use ($hardware, $user) {
            if ($reviewer->hasRole('superadmin') || $reviewer->branch_id === $user->branch_id) {
                $reviewer->notify(new HardwareVerificationRequested($hardware->id, $hardware->hardware_no));
            }
        });

        return back()->with('success', 'Hardware submitted for verification.');
    }
}
