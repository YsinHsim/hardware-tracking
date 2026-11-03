<?php

namespace App\Http\Controllers;

use App\Models\HardwareStatus;
use App\Models\HardwareType;
use App\Models\UserPosition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemDataController extends Controller
{
    public function index()
    {
        return inertia('SystemData/Index', [
            'userPositions' => UserPosition::select('id', 'position_name as name')->get(),
            'hardwareStatuses' => HardwareStatus::select('id', 'hardware_status_name as name')->get(),
            'hardwareTypes' => HardwareType::select('id', 'hardware_type_name as name')->get(),
        ]);
    }

    public function create($type)
    {
        return inertia('SystemData/Create', ['type' => $type]);
    }

    public function store(Request $request, $type)
    {
        $request->validate(['name' => 'required|string|max:255']);

        if ($type === 'user_positions') {
            UserPosition::create(['position_name' => $request->name]);
        } elseif ($type === 'hardware_statuses') {
            HardwareStatus::create(['hardware_status_name' => $request->name]);
        } elseif ($type === 'hardware_types') {
            HardwareType::create(['hardware_type_name' => $request->name]);
        }

        return redirect('/system-data')->with('success', ucfirst(str_replace('_', ' ', $type)) . ' created successfully!');
    }

    public function edit($type, $id)
    {
        $model = $this->getModel($type);
        $record = $model::findOrFail($id);

        return inertia('SystemData/Edit', [
            'type' => $type,
            'record' => $record
        ]);
    }

    public function update(Request $request, $type, $id)
    {
        $model = $this->getModel($type);
        $record = $model::findOrFail($id);

        $record->update($request->all());

        return redirect()->route('system-data.index')->with('success', ucfirst(str_replace('_', ' ', $request->type)) . ' updated successfully.');
    }

    public function destroy($itemType, $id): RedirectResponse
    {
        $models = [
            'user_positions' => UserPosition::class,
            'hardware_statuses' => HardwareStatus::class,
            'hardware_types' => HardwareType::class,
        ];

        if (!array_key_exists($itemType, $models)) {
            return redirect()->back()->with('error', 'Invalid item type');
        }

        $model = $models[$itemType];
        $item = $model::find($id);

        if (!$item) {
            return redirect()->back()->with('error', ucfirst(str_replace('_', ' ', $itemType)) . ' not found');
        }

        if ($itemType === 'user_positions') {
            $dependentCount = $item->assignedUsers()->count();

            if ($dependentCount > 0) {
                return back()->withErrors(['delete' => "Cannot delete user position \"{$item->position_name}\": {$dependentCount} assigned users still belong to it. Move or delete them first."]);
            }
        } else {
            $dependentCount = $item->hardwares()->withTrashed()->count();

            if ($dependentCount > 0) {
                $trashedHardwareCount = $item->hardwares()->onlyTrashed()->count();
                $deletedHardwareNote = $trashedHardwareCount > 0 ? ' (including deleted hardware)' : '';
                $itemName = $itemType === 'hardware_statuses' ? $item->hardware_status_name : $item->hardware_type_name;
                $itemLabel = $itemType === 'hardware_statuses' ? 'hardware status' : 'hardware type';

                return back()->withErrors(['delete' => "Cannot delete {$itemLabel} \"{$itemName}\": {$dependentCount} hardware records{$deletedHardwareNote} still belong to it. Move or delete them first."]);
            }
        }

        $item->delete();

        return redirect()->route('system-data.index')->with('success', ucfirst(str_replace('_', ' ', $itemType)) . ' deleted successfully');
    }

    private function getModel($type)
    {
        return match ($type) {
            'user_positions' => UserPosition::class,
            'hardware_statuses' => HardwareStatus::class,
            'hardware_types' => HardwareType::class,
            default => abort(400, 'Invalid type provided')
        };
    }
}
