<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Item\IndexItemRequest;
use App\Http\Requests\Item\StoreItemRequest;
use App\Http\Requests\Item\UpdateItemRequest;
use App\Models\Item;
use App\Models\ProductType;
use Exception;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexItemRequest $request): Response
    {
        $search = $request->input('search');
        $perPage = $request->input('perPage', 10);

        $items = Item::query()
            ->mine()
            ->when($search, function ($query) use ($search) {
                $query->whereLike('serial_number', "%{$search}%");
            })
            ->with('productType')
            ->latest()
            ->paginate($perPage);

        $productTypes = ProductType::all();

        return Inertia::render('items/index', [
            'items' => $items,
            'productTypes' => $productTypes,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreItemRequest $request)
    {
        try {
            $serialInputs = $request->serialInputs;
            $productTypeId = $request->product_type_id;
            $itemsData = [];

            foreach($serialInputs as $field) {
                if($value = $field['value']) {
                    $itemsData[] = [
                        "product_type_id" => $productTypeId,
                        "serial_number" => $value
                    ];
                }
            }
            
            auth()->user()->items()->createMany($itemsData);

            return back()->with('success', 'Item created successfully');
        } catch (Exception) {
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateItemRequest $request, Item $item)
    {
        try {
            $this->ensureItemBelongsToUser($item);

            $item->update($request->validated());

            return back()->with('success', 'Item updated successfully');
        } catch (Exception) {
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        try {
            $this->ensureItemBelongsToUser($item);

            $item->delete();

            return back()->with('success', 'Item deleted successfully');
        } catch (Exception) {
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Toggle the sold status of the specified item.
     */
    public function toggleSold(Item $item)
    {
        try {
            $this->ensureItemBelongsToUser($item);

            $item->update([
                'is_sold' => !$item->is_sold,
                'sold_at' => $item->is_sold ? null : now()
            ]);

            $successMessage = $item->is_sold ? 'Item marked as sold' : 'Item marked as unsold';
            return back()->with('success', $successMessage);
        } catch (Exception) {
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Ensure the item belongs to the authenticated user.
     */
    private function ensureItemBelongsToUser(Item $item)
    {
        if ($item->added_by !== auth()->id()) {
            abort(403);
        }
    }
}