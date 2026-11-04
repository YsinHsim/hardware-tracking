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
    private const VALIDATION_ATTRIBUTES = [
        'hardware_no' => 'hardware number',
        'hardware_serial_no' => 'serial number',
        'hardware_type_id' => 'hardware type',
        'hardware_status_id' => 'hardware status',
        'assigned_user_id' => 'assigned user',
    ];

    public function index(Request $request)
    {
        $search = mb_substr(trim($request->string('search')->toString()), 0, 100);
        $estateId = $request->query('estate_id');
        $estateId = $estateId === 'unassigned' ? 'unassigned' : ($request->integer('estate_id') ?: null);
        $hardwareTypeId = $request->integer('hardware_type_id') ?: null;
        $hardwareStatusId = $request->integer('hardware_status_id') ?: null;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $hardwares = Hardware::with([
            'assignedUser.estate',
            'hardwareType',
            'hardwareStatus'
        ])
            ->when($search !== '', function ($query) use ($search) {
                $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

                $query->where(function ($query) use ($escapedSearch) {
                    $query->whereRaw("hardware_no LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereRaw("hardware_serial_no LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereHas('assignedUser', fn ($query) => $query->whereRaw("user_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('assignedUser.estate', fn ($query) => $query->whereRaw("estate_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('hardwareType', fn ($query) => $query->whereRaw("hardware_type_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('hardwareStatus', fn ($query) => $query->whereRaw("hardware_status_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]));
                });
            })
            ->when($estateId === 'unassigned', fn ($query) => $query->whereNull('assigned_user_id'))
            ->when(is_int($estateId), function ($query) use ($estateId) {
                $query->whereHas('assignedUser', fn ($query) => $query->where('estate_id', $estateId));
            })
            ->when($hardwareTypeId, fn ($query) => $query->where('hardware_type_id', $hardwareTypeId))
            ->when($hardwareStatusId, fn ($query) => $query->where('hardware_status_id', $hardwareStatusId))
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Hardwares/Index', [
            'hardwares' => $hardwares,
            'filters' => [
                'search' => $search,
                'estate_id' => $estateId,
                'hardware_type_id' => $hardwareTypeId,
                'hardware_status_id' => $hardwareStatusId,
                'per_page' => $perPage,
            ],
            'total' => $hardwares->total(),
            'estates' => Estate::query()->select('id', 'estate_name')->orderBy('estate_name')->get(),
            'hardwareTypes' => HardwareType::query()->select('id', 'hardware_type_name')->orderBy('hardware_type_name')->get(),
            'hardwareStatuses' => HardwareStatus::query()->select('id', 'hardware_status_name')->orderBy('hardware_status_name')->get(),
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
            'hardware_serial_no' => 'required|string|max:255|unique:hardwares,hardware_serial_no',
            'assigned_user_id' => 'nullable|exists:assigned_users,id',
            'hardware_type_id' => 'required|exists:hardware_types,id',
            'hardware_status_id' => 'required|exists:hardware_statuses,id',
        ], [], self::VALIDATION_ATTRIBUTES);

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
            'hardware_serial_no' => "required|string|max:255|unique:hardwares,hardware_serial_no,{$hardware->id}",
            'assigned_user_id' => 'nullable|exists:assigned_users,id',
            'hardware_type_id' => 'required|exists:hardware_types,id',
            'hardware_status_id' => 'required|exists:hardware_statuses,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        $changes = [];
        foreach ($validatedData as $key => $value) {
            if ($hardware->{$key} != $value) {
                $label = $this->changeFieldLabel($key);
                $oldValue = $this->changeFieldValue($hardware, $key, $hardware->{$key});
                $newValue = $this->changeFieldValue($hardware, $key, $value);
                $changes[] = "{$label} changed from '{$oldValue}' to '{$newValue}'";
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
        $hardware->load(['assignedUser.estate', 'hardwareType', 'hardwareStatus', 'updateRecords.user:id,name']);

        return Inertia::render('Hardwares/Show', [
            'hardware' => $hardware
        ]);
    }

    private function changeFieldLabel(string $key): string
    {
        return match ($key) {
            'hardware_type_id' => 'Hardware type',
            'hardware_status_id' => 'Hardware status',
            'assigned_user_id' => 'Assigned user',
            'hardware_no' => 'Hardware no',
            'hardware_serial_no' => 'Serial no',
            default => ucfirst(str_replace('_', ' ', $key)),
        };
    }

    private function changeFieldValue(Hardware $hardware, string $key, mixed $value): string
    {
        return match ($key) {
            'hardware_type_id' => (int) $hardware->hardware_type_id === (int) $value
                ? ($hardware->hardwareType?->hardware_type_name ?? 'Unknown')
                : (HardwareType::find($value)?->hardware_type_name ?? 'Unknown'),
            'hardware_status_id' => (int) $hardware->hardware_status_id === (int) $value
                ? ($hardware->hardwareStatus?->hardware_status_name ?? 'Unknown')
                : (HardwareStatus::find($value)?->hardware_status_name ?? 'Unknown'),
            'assigned_user_id' => $value === null
                ? 'Unassigned'
                : ((int) $hardware->assigned_user_id === (int) $value
                    ? ($hardware->assignedUser?->user_name ?? 'Unknown')
                    : (AssignedUser::find($value)?->user_name ?? 'Unknown')),
            default => (string) $value,
        };
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

    public function report(Hardware $hardware)
    {
        return Inertia::render('Hardwares/Report', [
            'hardware_id' => $hardware->id,
            'hardware_no' => $hardware->hardware_no,
            'hardware_serial_no' => $hardware->hardware_serial_no,
            'hardware_user' => optional($hardware->assignedUser)->user_name ?? 'Unassigned',
            'hardware_type' => optional($hardware->hardwareType)->hardware_type_name ?? 'Unassigned',
            'hardware_status' => optional($hardware->hardwareStatus)->hardware_status_name ?? 'Unassigned',
            'estate_name' => optional(optional($hardware->assignedUser)->estate)->estate_name ?? 'Unassigned',
        ]);
    }
}
