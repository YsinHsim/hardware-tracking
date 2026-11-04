<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class RegionController extends Controller
{
    private const VALIDATION_ATTRIBUTES = [
        'region_name' => 'region name',
    ];

    /**
     * Store a newly created region in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'region_name' => 'required|string|max:255|unique:regions,region_name',
        ], [], self::VALIDATION_ATTRIBUTES);

        Region::create($validated);

        return Redirect::back()->with('success', 'Region created successfully.');
    }

    /**
     * Update the specified region in storage.
     */
    public function update(Request $request, Region $region)
    {
        $validated = $request->validate([
            'region_name' => 'required|string|max:255|unique:regions,region_name,' . $region->id,
        ], [], self::VALIDATION_ATTRIBUTES);

        $region->update($validated);

        return Redirect::back()->with('success', 'Region updated successfully.');
    }

    /**
     * Remove the specified region from storage.
     */
    public function destroy(Region $region)
    {
        $branchCount = $region->branches()->count();

        if ($branchCount > 0) {
            $branchLabel = Str::plural('branch', $branchCount);
            $verb = $branchCount === 1 ? 'belongs' : 'belong';
            return back()->withErrors(['delete' => "Cannot delete region \"{$region->region_name}\": {$branchCount} {$branchLabel} still {$verb} to it. Move or delete them first."]);
        }

        $region->delete();

        return Redirect::back()->with('success', 'Region deleted successfully.');
    }
}
