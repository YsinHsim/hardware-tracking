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
     * Display a listing of the estates.
     */
    public function index(Request $request)
    {
        $search = mb_substr(trim($request->string('search')->toString()), 0, 100);
        $regionId = $request->integer('region_id') ?: null;
        $perPage = (int) $request->query('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $estates = Estate::with('region')
            ->when($search !== '', function ($query) use ($search) {
                $escapedSearch = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $search);

                $query->where(function ($query) use ($escapedSearch) {
                    $query->whereRaw("estate_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"])
                        ->orWhereHas('region', fn ($query) => $query->whereRaw("region_name LIKE ? ESCAPE '!'", ["%{$escapedSearch}%"]));
                });
            })
            ->when($regionId, fn ($query) => $query->where('region_id', $regionId))
            ->orderBy('estate_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Estates/Index', [
            'estates' => $estates,
            'filters' => [
                'search' => $search,
                'region_id' => $regionId,
                'per_page' => $perPage,
            ],
            'total' => $estates->total(),
            'regions' => Region::query()->select('id', 'region_name')->orderBy('region_name')->get(),
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
