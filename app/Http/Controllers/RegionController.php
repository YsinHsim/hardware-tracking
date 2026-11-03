<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class RegionController extends Controller
{
    /**
     * Store a newly created region in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'region_name' => 'required|string|max:255|unique:regions,region_name',
        ]);

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
        ]);

        $region->update($validated);

        return Redirect::back()->with('success', 'Region updated successfully.');
    }

    /**
     * Remove the specified region from storage.
     */
    public function destroy(Region $region)
    {
        $estateCount = $region->estates()->count();

        if ($estateCount > 0) {
            $estateLabel = Str::plural('estate', $estateCount);
            $verb = $estateCount === 1 ? 'belongs' : 'belong';
            return back()->withErrors(['delete' => "Cannot delete region \"{$region->region_name}\": {$estateCount} {$estateLabel} still {$verb} to it. Move or delete them first."]);
        }

        $region->delete();

        return Redirect::back()->with('success', 'Region deleted successfully.');
    }
}
