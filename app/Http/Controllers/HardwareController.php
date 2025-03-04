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
            'assignedUser.estate',
            'hardwareType',
            'hardwareStatus'
        ])->paginate(5);

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

    public function edit(Hardware $hardware)
    {
        return Inertia::render('Hardwares/Edit', [
            'hardware' => $hardware->load(['assignedUser.estate', 'hardwareType', 'hardwareStatus']),
            'hardwareTypes' => HardwareType::all(),
            'hardwareStatuses' => HardwareStatus::all(),
            'estates' => Estate::all(),
            'assignedUsers' => AssignedUser::with('estate')->get()->groupBy('estate_id'),
        ]);
    }

    public function update(Request $request, Hardware $hardware)
    {
        $validatedData = $request->validate([
            'hardware_no' => "required|string|unique:hardwares,hardware_no,{$hardware->id}",
            'hardware_serial_no' => 'nullable|string',
            'assigned_user_id' => 'nullable|exists:assigned_users,id',
            'hardware_type_id' => 'required|exists:hardware_types,id',
            'hardware_status_id' => 'required|exists:hardware_statuses,id',
        ]);

        $changes = [];
        foreach ($validatedData as $key => $value) {
            if ($hardware->{$key} != $value) {
                $changes[] = ucfirst(str_replace('_', ' ', $key)) . " changed from '{$hardware->{$key}}' to '{$value}'";
            }
        }

        $hardware->update($validatedData);

        if (!empty($changes)) {
            UpdateRecord::create([
                'record_name' => 'Hardware Updated',
                'record_desc' => "Hardware (No: {$hardware->hardware_no}) was updated. " . implode(', ', $changes),
                'record_last_updated' => now(),
                'hardware_id' => $hardware->id,
            ]);
        }

        return Redirect::route('hardwares.index')->with('success', 'Hardware updated successfully.');
    }

    public function show(Hardware $hardware)
    {
        $hardware->load(['assignedUser.estate', 'hardwareType', 'hardwareStatus', 'updateRecords']);

        return Inertia::render('Hardwares/Show', [
            'hardware' => $hardware
        ]);
    }

    public function destroy(Hardware $hardware)
    {
        // Insert delete record
        UpdateRecord::create([
            'record_name' => 'Hardware Deleted',
            'record_desc' => "Hardware (No: {$hardware->hardware_no}) was deleted.",
            'record_last_updated' => now(),
            'hardware_id' => $hardware->id,
        ]);

        $hardware->delete();

        return Redirect::route('hardwares.index')->with('success', 'Hardware deleted successfully.');
    }
}
