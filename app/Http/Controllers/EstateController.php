<?php

namespace App\Http\Controllers;

use App\Models\Estate;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EstateController extends Controller
{
    private const VALIDATION_ATTRIBUTES = [
        'estate_name' => 'estate name',
        'region_id' => 'region',
    ];

    /**
     * Display a listing of the estates grouped by regions.
     */
    public function index()
    {
        $estates = Estate::with('region')->paginate(5);
        return Inertia::render('Estates/Index', [
            'estates' => $estates,
        ]);
    }

    /**
     * Show the form for creating a new estate.
     */
    public function create()
    {
        $regions = Region::all();
        $estates = Estate::all();
        return Inertia::render('Estates/Create', [
            'estates' => $estates,
            'regions' => $regions,
        ]);
    }

    /**
     * Store a newly created estate in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'estate_name' => 'required|string|max:255',
            'region_id' => 'required|exists:regions,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        Estate::create($validated);

        // return Redirect::route('estates.index')->with('success', 'Estate created successfully.');
        return Redirect::back()->with('success', 'Estate created successfully.');
    }

    /**
     * Show the form for editing an estate.
     */
    public function edit(Estate $estate)
    {
        $regions = Region::all();
        return Inertia::render('Estates/Edit', [
            'estate' => $estate,
            'regions' => $regions,
        ]);
    }

    /**
     * Update the specified estate in storage.
     */
    public function update(Request $request, Estate $estate)
    {
        $validated = $request->validate([
            'estate_name' => 'required|string|max:255',
            'region_id' => 'required|exists:regions,id',
        ], [], self::VALIDATION_ATTRIBUTES);

        $estate->update($validated);

        return Redirect::route('estates.index')->with('success', 'Estate updated successfully.');
    }

    /**
     * Remove the specified estate from storage.
     */
    public function destroy(Estate $estate)
    {
        $assignedUserCount = $estate->assignedUsers()->count();

        if ($assignedUserCount > 0) {
            $assignedUserLabel = Str::plural('assigned user', $assignedUserCount);
            $verb = $assignedUserCount === 1 ? 'belongs' : 'belong';
            return back()->withErrors(['delete' => "Cannot delete estate \"{$estate->estate_name}\": {$assignedUserCount} {$assignedUserLabel} still {$verb} to it. Move or delete them first."]);
        }

        $estate->delete();
        return Redirect::route('estates.index')->with('success', 'Estate deleted successfully.');
    }
}
