<?php

namespace App\Http\Controllers;

use App\Models\AssignedUser;
use App\Models\Estate;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\UpdateRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class HardwareController extends Controller
{
    public function index()
    {
        $hardwares = Hardware::with([
            'assignedUser.estate',  // Ensure estate is loaded inside assignedUser
            'hardwareType',
            'hardwareStatus'
        ])->get();

        return Inertia::render('Hardwares/Index', [
            'hardwares' => $hardwares,
        ]);
    }

    public function create()
    {
        return Inertia::render('Hardwares/Create', [
            'hardwareTypes' => HardwareType::all(),
            'hardwareStatuses' => HardwareStatus::all(),
            'estates' => Estate::all(),
            'assignedUsers' => AssignedUser::with('estate')->get()->groupBy('estate_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'hardware_no' => 'required|string|unique:hardwares,hardware_no',
            'hardware_serial_no' => 'nullable|string|unique:hardwares,hardware_serial_no',
            'assigned_user_id' => 'nullable|exists:assigned_users,id',
            'hardware_type_id' => 'required|exists:hardware_types,id',
            'hardware_status_id' => 'required|exists:hardware_statuses,id',
        ]);

        $hardware = Hardware::create($validatedData);

        // Insert update record
        UpdateRecord::create([
            'record_name' => 'Hardware Created',
            'record_desc' => "New hardware (No: {$hardware->hardware_no}) was added.",
            'record_last_updated' => now(),
            'hardware_id' => $hardware->id,
        ]);

        return Redirect::route('hardwares.index')->with('success', 'Hardware created successfully.');
    }
}
