import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { toast } from "sonner";
import { Head, usePage, useForm, router } from '@inertiajs/react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    Plus,
    LoaderCircle,
} from "lucide-react";
import { set } from 'react-hook-form';

// Define the item type structure
type Item = {
    id: number;
    serial_number: string;
    product_type_id: number;
    product_type_name: string;
    is_sold: boolean;
    sold_at: string | null;
    created_at: string;
    product_type: ProductType;
};

// Define product type for select options
type ProductType = {
    id: number;
    name: string;
};

// Define pagination metadata
type PaginationData = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

// Define form data types
type CreateItemForm = {
    serial_number: string;
    product_type_id: number | string;
    quantity: number;
    serialInputs: { id: number; value: string }[];
};

type EditItemForm = {
    serial_number: string;
    product_type_id: number | string;
};

// Define the page props structure
interface PageProps {
    items: {
        data: Item[];
    } & PaginationData;
    productTypes: ProductType[];
    filters: {
        search: string;
        perPage: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Items',
        href: '/items',
    },
];

export default function Items() {
    // Get items and pagination data from the page props
    const { items, productTypes, filters } = usePage().props as unknown as PageProps;

    // State for modals and forms
    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(filters.perPage || 10);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [serialInputs, setSerialInputs] = useState([{ id: 1, value: '' }]);

    // Create form using Inertia's useForm
    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreateForm } = useForm<CreateItemForm>({
        serial_number: '',
        product_type_id: '',
        quantity: 1,
        serialInputs: [{ id: 1, value: '' }],
    });

    // Edit form using Inertia's useForm
    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm<EditItemForm>({
        serial_number: '',
        product_type_id: '',
    });

    // Handle search input change
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== filters.search) {
                router.get('/items', {
                    search,
                    perPage
                }, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    // Handle per page change
    useEffect(() => {
        if (perPage !== filters.perPage) {
            router.get('/items', {
                search,
                perPage,
            }, {
                preserveState: true,
            });
        }
    }, [perPage]);

    // Handle quantity change to generate serial number inputs
    useEffect(() => {
        const quantity = createData.quantity;
        if (quantity > 0) {
            const currentSerialInputs = createData.serialInputs || [];
            
            const newSerialInputs = Array.from({ length: quantity }, (_, index) => {
                const existingEntry = currentSerialInputs[index];

                return {
                id: index + 1,
                value: existingEntry
                    ? existingEntry.value 
                    : (index === 0 ? createData.serial_number : '')
                }
            })
      
          setSerialInputs(newSerialInputs);
          setCreateData('serialInputs', newSerialInputs);
        }
    }, [createData.quantity]);

    // Update first serial input when serial_number changes
    useEffect(() => {
        if (serialInputs.length > 0) {
            const updatedInputs = [...serialInputs];
            updatedInputs[0].value = createData.serial_number;
            setSerialInputs(updatedInputs);
        }
    }, [createData.serial_number]);

    // Handle pagination navigation
    const goToPage = (page: number) => {
        router.get('/items', {
            page,
            search,
            perPage
        }, {
            preserveState: true,
        });
    };

    // Format date function
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Handle serial number input change
    const handleSerialInputChange = (id: number, value: string) => {
        const updatedInputs = serialInputs.map(input => {
            if (input.id === id) {
                return { ...input, value };
            }
            return input;
        });
        setSerialInputs(updatedInputs);
        setCreateData('serialInputs', updatedInputs);
        
        // Update the main serial number if the first input changes
        if (id === 1) {
            setCreateData('serial_number', value);
        }
    };

    // Handle create form submission
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createPost('/items', {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreateForm();
                setSerialInputs([{ id: 1, value: '' }]);
            },
            onError: () => {
                toast.error("Failed to create items.");
            },
        });
    };

    // Handle edit form submission
    const [editFormErrors, setEditErrors] = useState<{ serial_number?: string[]; product_type_id?: string[] }>({});
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem) return;

        router.post(`/items/${currentItem.id}`, {
            _method: 'put',
            serial_number: editData.serial_number,
            product_type_id: editData.product_type_id
        }, {
            onSuccess: () => {
                setIsEditOpen(false);
                resetEditForm();
                setCurrentItem(null);
                setEditErrors({});
            },
            onError: (errors) => {     
                setEditErrors(errors);
                toast.error("Failed to update item.");
            },
        });
    };

    // Handle delete action
    const handleDelete = () => {
        if (!currentItem) return;
        router.delete(`/items/${currentItem.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setCurrentItem(null);
            },
            onError: () => {
                toast.error("Failed to delete item.");
            },
        });
    };

    // Handle is_sold toggle
    const handleToggleSold = (item: Item) => {
        router.post(`/items/${item.id}/toggle-sold`, {}, {
            onSuccess: () => {
                toast.success(`Item ${item.is_sold ? 'unmarked' : 'marked'} as sold.`);
            },
            onError: () => {
                toast.error("Failed to update item status.");
            },
        });
    };

    // Open edit modal with item data
    const openEditModal = (item: Item) => {
        setCurrentItem(item);
        resetEditForm();
        setEditData({...editData , serial_number: item.serial_number, product_type_id: item.product_type_id});
        setIsEditOpen(true);
    };

    // Open delete confirmation
    const openDeleteConfirmation = (item: Item) => {
        setCurrentItem(item);
        setIsDeleteOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Items</h1>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create New Item</DialogTitle>
                                <DialogDescription>
                                    Add a new item to your inventory.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="py-4 grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="product_type_id">Product Type</Label>
                                        <Select 
                                            value={createData.product_type_id.toString()} 
                                            onValueChange={(value) => setCreateData('product_type_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={createErrors.product_type_id} />
                                    </div>
                                    
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            max="100"
                                            placeholder="Enter quantity"
                                            value={createData.quantity}
                                            onChange={(e) => {
                                                let value = parseInt(e.target.value) || 1;
                                                value = Math.max(1, Math.min(100, value));
                                                setCreateData('quantity', value);
                                            }}
                                        
                                        />
                                    </div>
                                    <div className="grid gap-4">
                                        <Label>Serial Numbers</Label>
                                        <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                                            {serialInputs.map((input, index) => (
                                                <div key={input.id} className="flex gap-2 items-center">
                                                    <span className="text-sm text-gray-500 w-6">{input.id}.</span>
                                                    <Input
                                                        placeholder={`Enter serial number ${input.id}`}
                                                        value={input.value}
                                                        onChange={(e) => handleSerialInputChange(input.id, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={createErrors.serial_number} />
                                    </div>
                                    <InputError message={createErrors.serialInputs} />
                                </div>
                                
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsCreateOpen(false);
                                        resetCreateForm();
                                        setSerialInputs([{ id: 1, value: '' }]);
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createProcessing}>
                                        {createProcessing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                        Create
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Show</span>
                        <Select value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">entries</span>
                    </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-4">Serial Number</TableHead>
                                <TableHead className="p-4">Product Type</TableHead>
                                <TableHead className="p-4">Sold Status</TableHead>
                                <TableHead className="p-4">Sold At</TableHead>
                                <TableHead className="p-4">Created</TableHead>
                                <TableHead className="w-16 p-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.data.length > 0 ? (
                                items.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium p-4">{item.serial_number}</TableCell>
                                        <TableCell className="p-4">{item.product_type.name}</TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={item.is_sold} 
                                                    onCheckedChange={() => handleToggleSold(item)}
                                                    className="cursor-pointer"
                                                />
                                                <span>{item.is_sold ? 'Sold' : 'Available'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">{item.sold_at ? formatDate(item.sold_at) : 'N/A'}</TableCell>
                                        <TableCell className="p-4">{formatDate(item.created_at)}</TableCell>
                                        <TableCell className="p-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id.toString())}>
                                                        Copy ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(item)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => openDeleteConfirmation(item)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center p-4">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {items.data.length > 0 && (
                    <div className="flex items-center justify-between px-4">
                        <div className="text-sm text-gray-500">
                            Showing {items.from} to {items.to} of {items.total} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(1)}
                                disabled={items.current_page === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(items.current_page - 1)}
                                disabled={items.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {items.current_page} of {items.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(items.current_page + 1)}
                                disabled={items.current_page === items.last_page}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(items.last_page)}
                                disabled={items.current_page === items.last_page}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Update the item details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="py-4 grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-serial_number">Serial Number</Label>
                                <Input
                                    id="edit-serial_number"
                                    placeholder="Enter serial number"
                                    value={editData.serial_number}
                                    onChange={(e) => setEditData('serial_number', e.target.value)}
                                />
                                <InputError message={editFormErrors.serial_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-product_type">Product Type</Label>
                                <Select 
                                    value={editData.product_type_id.toString()} 
                                    onValueChange={(value) => setEditData('product_type_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editFormErrors.product_type_id} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setIsEditOpen(false);
                                resetEditForm();
                            }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editProcessing}>
                                {editProcessing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the item with serial number "{currentItem?.serial_number}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}