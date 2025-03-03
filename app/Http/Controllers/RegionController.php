<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

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
        $region->delete();

        return Redirect::back()->with('success', 'Region deleted successfully.');
    }
}
