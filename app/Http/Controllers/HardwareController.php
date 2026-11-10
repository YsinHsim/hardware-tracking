<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Hardware;
use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\UpdateRecord;
use App\Models\User;
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
        $branchId = $request->query('branch_id');
        $branchId = $branchId === 'unassigned' ? 'unassigned' : ($request->integer('branch_id') ?: null);
        $hardwareTypeId = $request->integer('hardware_type_id') ?: null;
        $hardwareStatusId = $request->integer('hardware_status_id') ?: null;
        $verificationStatus = $request->query('verification_status');
        $verificationStatus = in_array($verificationStatus, ['pending', 'verified', 'changes_requested', 'rejected'], true) ? $verificationStatus : null;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $hardwares = Hardware::with([
            'assignedUser',
            'hardwareType',
            'hardwareStatus'
        ])
            ->when($search !== '', function ($query) use ($search) {
                $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

                $query->where(function ($query) use ($escapedSearch) {
                    $query->whereRaw("hardware_no LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereRaw("hardware_serial_no LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhere('assigned_user_name', 'like', "%{$escapedSearch}%")
                        ->orWhereHas('assignedUser', fn ($query) => $query->whereRaw("name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('assignedUser.branch', fn ($query) => $query->whereRaw("branch_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('hardwareType', fn ($query) => $query->whereRaw("hardware_type_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]))
                        ->orWhereHas('hardwareStatus', fn ($query) => $query->whereRaw("hardware_status_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]));
                });
            })
            ->when($branchId === 'unassigned', fn ($query) => $query->whereNull('user_id'))
            ->when(is_int($branchId), function ($query) use ($branchId) {
                $query->whereHas('assignedUser', fn ($query) => $query->where('branch_id', $branchId));
            })
            ->when($hardwareTypeId, fn ($query) => $query->where('hardware_type_id', $hardwareTypeId))
            ->when($hardwareStatusId, fn ($query) => $query->where('hardware_status_id', $hardwareStatusId))
            ->when($verificationStatus, fn ($query) => $query->where('verification_status', $verificationStatus))
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Hardwares/Index', [
            'hardwares' => $hardwares,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
                'hardware_type_id' => $hardwareTypeId,
                'hardware_status_id' => $hardwareStatusId,
                'verification_status' => $verificationStatus,
                'per_page' => $perPage,
            ],
            'total' => $hardwares->total(),
            'branches' => Branch::query()->select('id', 'branch_name')->orderBy('branch_name')->get(),
            'hardwareTypes' => HardwareType::query()->select('id', 'hardware_type_name')->orderBy('hardware_type_name')->get(),
            'hardwareStatuses' => HardwareStatus::query()->select('id', 'hardware_status_name')->orderBy('hardware_status_name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Hardwares/Create', [
            'hardwareTypes' => HardwareType::all(),
            'hardwareStatuses' => HardwareStatus::all(),
            'branches' => Branch::all(),
            'assignedUsers' => User::with(['branch', 'position'])->whereNotNull('profile_completed_at')->get()->groupBy('branch_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'hardware_no' => 'required|string|unique:hardwares,hardware_no',
            'hardware_serial_no' => 'required|string|max:255|unique:hardwares,hardware_serial_no',
            'assigned_user_id' => 'nullable|exists:users,id',
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
            'hardware' => $hardware->load(['assignedUser', 'hardwareType', 'hardwareStatus']),
            'hardwareTypes' => HardwareType::all(),
            'hardwareStatuses' => HardwareStatus::all(),
            'branches' => Branch::all(),
            'assignedUsers' => User::with(['branch', 'position'])->whereNotNull('profile_completed_at')->get()->groupBy('branch_id'),
        ]);
    }

    public function update(Request $request, Hardware $hardware)
    {
        $validatedData = $request->validate([
            'hardware_no' => "required|string|unique:hardwares,hardware_no,{$hardware->id}",
            'hardware_serial_no' => "required|string|max:255|unique:hardwares,hardware_serial_no,{$hardware->id}",
            'assigned_user_id' => 'nullable|exists:users,id',
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
        $hardware->load(['assignedUser', 'hardwareType', 'hardwareStatus', 'updateRecords.user:id,name', 'verifications.reviewer:id,name']);

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
                : ((int) $hardware->user_id === (int) $value
                    ? ($hardware->getRelationValue('assignedUser')?->name ?? $hardware->assigned_user_name ?? 'Unknown')
                    : (User::find($value)?->name ?? 'Unknown')),
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

}
