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

// Define the product type structure
type ProductType = {
    id: number;
    name: string;
    image: string;
    my_available_items_count: number;
    created_at: string;
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
type CreateProductTypeForm = {
    name: string;
    image: File;
};

type EditProductTypeForm = {
    name: string;
    image: File | null;
};

// Define the page props structure
interface PageProps {
    productTypes: {
        data: ProductType[];
    } & PaginationData;
    filters: {
        search: string;
        perPage: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Types',
        href: '/product-types',
    },
];

export default function ProductTypes() {
    // Get product types and pagination data from the page props
    const { productTypes, filters } = usePage().props as unknown as PageProps;
    const page = usePage();

    useEffect(() => {
        if (page.props.flash?.success) {
            toast.success(page.props.flash.success);
        }
        if (page.props.flash?.error) {
            toast.error(page.props.flash.error);
        }
    }, [page.props.flash]);

    // State for modals and forms
    const [search, setSearch] = useState(filters.search || "");
    const [perPage, setPerPage] = useState(filters.perPage || 10);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentProductType, setCurrentProductType] = useState<ProductType | null>(null);

    // Create form using Inertia's useForm (similar to login page)
    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreateForm } = useForm<CreateProductTypeForm>({
        name: '',
        image: null,
    });

    // Edit form using Inertia's useForm
    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm<EditProductTypeForm>({
        name: '',
        image: null,
    });

    // Handle search input change
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== filters.search) {
                router.get('/product-types', {
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
            router.get('/product-types', {
                search,
                perPage,
            }, {
                preserveState: true,
            });
        }
    }, [perPage]);

    // Handle pagination navigation
    const goToPage = (page: number) => {
        router.get('/product-types', {
            page,
            search,
            perPage
        }, {
            preserveState: true,
        });
    };

    // Format date function
    const formatDate = (dateString: string) => {
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

    // Handle create form submission
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createPost('/product-types', {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreateForm();
            },
            onError: () => {
                toast.error("Failed to create product type.");
            },
        });
    };
    const [editFormErrors, setEditErrors] = useState<{ name?: string[]; image?: string[] }>({});
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProductType) return;

        router.post(`/product-types/${currentProductType.id}`, {
            _method: 'put',
            name: editData.name,
            image: editData.image
        }, {
            onSuccess: () => {
                setIsEditOpen(false);
                resetEditForm();
                setCurrentProductType(null);
                setEditErrors({});
            },
            onError: (errors) => {     
                setEditErrors(errors);
                toast.error("Failed to update product type.");
            },
        });
    };

    // Handle delete action
    const handleDelete = () => {
        if (!currentProductType) return;
        router.delete(`/product-types/${currentProductType.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setCurrentProductType(null);
            },
            onError: () => {
                toast.error("Failed to delete product type.");
            },
        });
    };

    // Open edit modal with product type data
    const openEditModal = (productType: ProductType) => {
        setCurrentProductType(productType);
        resetEditForm();
        setEditData('name', productType.name);
        setIsEditOpen(true);
    };

    // Open delete confirmation
    const openDeleteConfirmation = (productType: ProductType) => {
        setCurrentProductType(productType);
        setIsDeleteOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Types" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Product Types</h1>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Product Type</DialogTitle>
                                <DialogDescription>
                                    Add a new product type to your catalog.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="py-4 grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Enter product type name"
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                        />
                                        <InputError message={createErrors.name} />
                                    </div>
                                </div>

                                <div className="py-4 grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="image">Image</Label>
                                        <Input
                                            id="image"
                                            type="file"
                                            onChange={(e) => setCreateData('image', e.target.files?.[0] || null)}
                                        />
                                        <InputError message={createErrors.image} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsCreateOpen(false);
                                        resetCreateForm();
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
                            placeholder="Search product types..."
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
                                <TableHead className="p-4">Name</TableHead>
                                <TableHead className="p-4">Image</TableHead>
                                <TableHead className="p-4">Items Count</TableHead>
                                <TableHead className="p-4">Created</TableHead>
                                <TableHead className="w-16 p-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productTypes.data.length > 0 ? (
                                productTypes.data.map((productType) => (
                                    <TableRow key={productType.id}>
                                        <TableCell className="font-medium p-4">{productType.name}</TableCell>
                                        <TableCell className="p-4">
                                            {productType.image ? (
                                                <img src={productType.image} className="object-contain w-16" alt="Product" />
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="p-4">{productType.my_available_items_count}</TableCell>
                                        <TableCell className="p-4">{formatDate(productType.created_at)}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(productType.id.toString())}>
                                                        Copy ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(productType)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => openDeleteConfirmation(productType)}
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
                                    <TableCell colSpan={4} className="h-24 text-center p-4">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {productTypes.data.length > 0 && (
                    <div className="flex items-center justify-between px-4">
                        <div className="text-sm text-gray-500">
                            Showing {productTypes.from} to {productTypes.to} of {productTypes.total} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(1)}
                                disabled={productTypes.current_page === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(productTypes.current_page - 1)}
                                disabled={productTypes.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {productTypes.current_page} of {productTypes.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(productTypes.current_page + 1)}
                                disabled={productTypes.current_page === productTypes.last_page}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(productTypes.last_page)}
                                disabled={productTypes.current_page === productTypes.last_page}
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
                        <DialogTitle>Edit Product Type</DialogTitle>
                        <DialogDescription>
                            Update the product type details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="py-4 grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    placeholder="Enter product type name"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                />
                                <InputError message={editFormErrors.name} />
                            </div>
                        </div>
                        <div className="py-4 grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="image">Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    onChange={(e) => setEditData('image', e.target.files?.[0] || null)}
                                />
                                <InputError message={editFormErrors.image} />
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
                            This will permanently delete the product type "{currentProductType?.name}".
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