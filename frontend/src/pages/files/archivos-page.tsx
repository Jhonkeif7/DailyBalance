import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import * as filesService from "@/services/files.service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Upload,
    FileText,
    FileSpreadsheet,
    FileImage,
    File,
    Folder,
    Search,
    Grid3X3,
    List,
    Download,
    Trash2,
    Eye,
    MoreVertical,
    X,
    CheckCircle2,
    AlertCircle,
    Clock,
    HardDrive,
    FolderPlus,
    FileArchive,
    FileCode,
    FileVideo,
    FileAudio,
} from "lucide-react";
import { toast } from "sonner";

// Tipos
interface FileItem {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    status: "completed" | "uploading" | "error";
    progress?: number;
    folder?: string;
    folderId?: string | null;
    storagePath: string;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: "uploading" | "completed" | "error";
}

// Funciones de utilidad
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getFileIcon(type: string) {
    const iconClass = "w-8 h-8";
    switch (type) {
        case "pdf":
            return <FileText className={`${iconClass} text-red-500`} />;
        case "spreadsheet":
            return <FileSpreadsheet className={`${iconClass} text-emerald-500`} />;
        case "image":
            return <FileImage className={`${iconClass} text-purple-500`} />;
        case "document":
            return <FileText className={`${iconClass} text-blue-500`} />;
        case "archive":
            return <FileArchive className={`${iconClass} text-amber-500`} />;
        case "code":
            return <FileCode className={`${iconClass} text-cyan-500`} />;
        case "video":
            return <FileVideo className={`${iconClass} text-pink-500`} />;
        case "audio":
            return <FileAudio className={`${iconClass} text-orange-500`} />;
        case "presentation":
            return <FileText className={`${iconClass} text-orange-500`} />;
        default:
            return <File className={`${iconClass} text-gray-500`} />;
    }
}

function getFileType(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return "pdf";
    if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["doc", "docx", "txt", "rtf"].includes(ext)) return "document";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
    if (["js", "ts", "py", "java", "cpp", "html", "css", "json"].includes(ext)) return "code";
    if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio";
    if (["ppt", "pptx"].includes(ext)) return "presentation";
    return "other";
}

// Componente de área de Drop
function DropZone({ 
    onFilesSelected, 
    isDragging, 
    setIsDragging 
}: { 
    onFilesSelected: (files: FileList) => void;
    isDragging: boolean;
    setIsDragging: (value: boolean) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, [setIsDragging]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, [setIsDragging]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    }, [onFilesSelected, setIsDragging]);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div
            className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-300 
                ${isDragging 
                    ? "border-primary bg-primary/10 scale-[1.02]" 
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.rar,.mp3,.mp4"
            />
            
            <div className="flex flex-col items-center gap-4">
                <div className={`
                    p-4 rounded-full transition-all duration-300
                    ${isDragging ? "bg-primary/20" : "bg-muted/50"}
                `}>
                    <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                
                <div>
                    <p className="text-lg font-medium">
                        {isDragging ? "Suelta los archivos aquí" : "Arrastra y suelta archivos"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        o haz clic para seleccionar archivos
                    </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {["PDF", "Excel", "Word", "Imágenes", "ZIP"].map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Componente de archivo en subida
function UploadingFileItem({ 
    file, 
    onCancel 
}: { 
    file: UploadingFile; 
    onCancel: (id: string) => void;
}) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="p-2 rounded-lg bg-muted/50">
                {getFileIcon(getFileType(file.file.name))}
            </div>
            
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Progress value={file.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-10">{file.progress}%</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {file.status === "uploading" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onCancel(file.id)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
                {file.status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                )}
                {file.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                )}
            </div>
        </div>
    );
}

// Componente de archivo en lista
function FileListItem({ 
    file, 
    onDelete, 
    onDownload, 
    onPreview 
}: { 
    file: FileItem; 
    onDelete: (id: string) => void;
    onDownload: (file: FileItem) => void;
    onPreview: (file: FileItem) => void;
}) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30 group">
            <div className="p-2 rounded-lg bg-card/50">
                {getFileIcon(file.type)}
            </div>
            
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(file.size)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(file.uploadDate)}
                    </span>
                    {file.folder && (
                        <Badge variant="outline" className="text-xs">
                            <Folder className="w-3 h-3 mr-1" />
                            {file.folder}
                        </Badge>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onPreview(file)}
                    title="Previsualizar"
                >
                    <Eye className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onDownload(file)}
                    title="Descargar"
                >
                    <Download className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(file.id)}
                    title="Eliminar"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// Componente de archivo en grid
function FileGridItem({ 
    file, 
    onDelete, 
    onDownload, 
    onPreview 
}: { 
    file: FileItem; 
    onDelete: (id: string) => void;
    onDownload: (file: FileItem) => void;
    onPreview: (file: FileItem) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="relative p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30 group">
            <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-xl bg-card/50">
                    {getFileIcon(file.type)}
                </div>
                
                <div className="w-full text-center">
                    <p className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.size)}
                    </p>
                </div>
            </div>
            
            {/* Menu button */}
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowMenu(!showMenu)}
            >
                <MoreVertical className="w-4 h-4" />
            </Button>
            
            {/* Dropdown menu */}
            {showMenu && (
                <div className="absolute top-10 right-2 z-10 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                        className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                        onClick={() => { onPreview(file); setShowMenu(false); }}
                    >
                        <Eye className="w-4 h-4" /> Ver
                    </button>
                    <button
                        className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                        onClick={() => { onDownload(file); setShowMenu(false); }}
                    >
                        <Download className="w-4 h-4" /> Descargar
                    </button>
                    <button
                        className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive"
                        onClick={() => { onDelete(file.id); setShowMenu(false); }}
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}

// Componente principal
const ArchivesPage = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [folderList, setFolderList] = useState<filesService.FileFolder[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolder, setSelectedFolder] = useState("Todos");
    const [selectedType, setSelectedType] = useState("all");
    const [isDragging, setIsDragging] = useState(false);
    const [, setLoading] = useState(true);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Opciones del selector de carpetas.
    const folders = ["Todos", ...folderList.map((f) => f.name)];

    // Carga inicial: carpetas + archivos.
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [fldrs, fls] = await Promise.all([
                    filesService.getFolders(),
                    filesService.getFiles(),
                ]);
                if (!active) return;
                const nameById = new Map(fldrs.map((f) => [f.id, f.name]));
                setFolderList(fldrs);
                setFiles(
                    fls.map((u) => ({
                        id: u.id,
                        name: u.name,
                        type: u.type,
                        size: u.size,
                        uploadDate: new Date(u.createdAt),
                        status: "completed" as const,
                        folderId: u.folderId,
                        folder: (u.folderId && nameById.get(u.folderId)) || "Sin carpeta",
                        storagePath: u.storagePath,
                    }))
                );
            } catch (err) {
                console.error(err);
                toast.error("No se pudieron cargar los archivos");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    // Calcular estadísticas
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalFiles = files.length;

    // Filtrar archivos
    const filteredFiles = files.filter((file) => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolder === "Todos" || file.folder === selectedFolder;
        const matchesType = selectedType === "all" || file.type === selectedType;
        return matchesSearch && matchesFolder && matchesType;
    });

    // Subida real a Supabase Storage + metadata.
    const handleFilesSelected = useCallback((fileList: FileList) => {
        const targetFolder = folderList.find((f) => f.name === selectedFolder) ?? null;
        const targetName = targetFolder?.name ?? "Sin carpeta";

        Array.from(fileList).forEach((file) => {
            const uploadId = `upload-${Date.now()}-${Math.random()}`;
            setUploadingFiles((prev) => [
                ...prev,
                { id: uploadId, file, progress: 20, status: "uploading" as const },
            ]);

            filesService
                .uploadFile(file, {
                    folderId: targetFolder?.id ?? null,
                    onProgress: (pct) =>
                        setUploadingFiles((prev) =>
                            prev.map((f) => (f.id === uploadId ? { ...f, progress: pct } : f))
                        ),
                })
                .then((created) => {
                    setUploadingFiles((prev) =>
                        prev.map((f) =>
                            f.id === uploadId ? { ...f, progress: 100, status: "completed" as const } : f
                        )
                    );
                    setFiles((prev) => [
                        {
                            id: created.id,
                            name: created.name,
                            type: created.type,
                            size: created.size,
                            uploadDate: new Date(created.createdAt),
                            status: "completed" as const,
                            folderId: created.folderId,
                            folder: created.folderId ? targetName : "Sin carpeta",
                            storagePath: created.storagePath,
                        },
                        ...prev,
                    ]);
                    setTimeout(() => {
                        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
                    }, 1500);
                    toast.success(`${file.name} subido correctamente`);
                })
                .catch((err) => {
                    console.error(err);
                    setUploadingFiles((prev) =>
                        prev.map((f) => (f.id === uploadId ? { ...f, status: "error" as const } : f))
                    );
                    toast.error(`No se pudo subir ${file.name}`);
                });
        });
    }, [folderList, selectedFolder]);

    const handleCancelUpload = (id: string) => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
        toast.info("Subida cancelada");
    };

    const handleDeleteFile = async (id: string) => {
        const file = files.find((f) => f.id === id);
        if (!file) return;
        const prev = files;
        setFiles((curr) => curr.filter((f) => f.id !== id));
        try {
            await filesService.deleteFile({ id: file.id, storagePath: file.storagePath });
            toast.success("Archivo eliminado");
        } catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar el archivo");
            setFiles(prev);
        }
    };

    const handleDownloadFile = async (file: FileItem) => {
        try {
            const url = await filesService.getSignedUrl(file.storagePath);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error(err);
            toast.error("No se pudo descargar el archivo");
        }
    };

    const handlePreviewFile = async (file: FileItem) => {
        try {
            const url = await filesService.getSignedUrl(file.storagePath);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            console.error(err);
            toast.error("No se pudo previsualizar el archivo");
        }
    };

    const handleCreateFolder = async () => {
        const name = newFolderName.trim();
        if (!name) return;
        try {
            const created = await filesService.createFolder(name);
            setFolderList((prev) => [...prev, created]);
            setNewFolderName("");
            setShowNewFolder(false);
            toast.success("Carpeta creada");
        } catch (err) {
            console.error(err);
            toast.error("No se pudo crear la carpeta");
        }
    };

    return (
        <PageContainer>
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
                <StatCard
                    compact
                    title="Archivos totales"
                    value={String(totalFiles)}
                    tone="primary"
                    icon={<Folder className="h-full w-full" />}
                />
                <StatCard
                    compact
                    title="Espacio utilizado"
                    value={formatFileSize(totalSize)}
                    tone="muted"
                    icon={<HardDrive className="h-full w-full" />}
                />
                <StatCard
                    compact
                    title="En proceso"
                    value={String(uploadingFiles.length)}
                    tone="primary"
                    icon={<Upload className="h-full w-full" />}
                />
            </div>

            {/* Zona de subida */}
            <Card className="bg-card/60 backdrop-blur border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Subir Archivos
                    </CardTitle>
                    <CardDescription>
                        Arrastra archivos o haz clic para seleccionar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DropZone 
                        onFilesSelected={handleFilesSelected} 
                        isDragging={isDragging}
                        setIsDragging={setIsDragging}
                    />
                    
                    {/* Lista de archivos subiendo */}
                    {uploadingFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Subiendo archivos...</p>
                            {uploadingFiles.map((file) => (
                                <UploadingFileItem 
                                    key={file.id} 
                                    file={file} 
                                    onCancel={handleCancelUpload} 
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Lista de archivos */}
            <Card className="bg-card/60 backdrop-blur border-border/60">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Mis Archivos</CardTitle>
                            <CardDescription>
                                {filteredFiles.length} archivos encontrados
                            </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowNewFolder(true)}>
                                <FolderPlus className="w-4 h-4" />
                                Nueva carpeta
                            </Button>
                        </div>
                    </div>
                    
                    {/* Filtros */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar archivos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-muted/30"
                            />
                        </div>
                        
                        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-muted/30">
                                <Folder className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {folders.map((folder) => (
                                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-muted/30">
                                <File className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="spreadsheet">Excel</SelectItem>
                                <SelectItem value="document">Documentos</SelectItem>
                                <SelectItem value="image">Imágenes</SelectItem>
                                <SelectItem value="archive">Archivos ZIP</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <div className="flex border border-border rounded-lg overflow-hidden">
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-none h-9"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="sm"
                                className="rounded-none h-9"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent>
                    {filteredFiles.length === 0 ? (
                        <div className="text-center py-12">
                            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium">No hay archivos</p>
                            <p className="text-sm text-muted-foreground">
                                Sube archivos arrastrándolos o haciendo clic en el área de subida
                            </p>
                        </div>
                    ) : viewMode === "list" ? (
                        <div className="space-y-2">
                            {filteredFiles.map((file) => (
                                <FileListItem
                                    key={file.id}
                                    file={file}
                                    onDelete={handleDeleteFile}
                                    onDownload={handleDownloadFile}
                                    onPreview={handlePreviewFile}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <FileGridItem
                                    key={file.id}
                                    file={file}
                                    onDelete={handleDeleteFile}
                                    onDownload={handleDownloadFile}
                                    onPreview={handlePreviewFile}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Diálogo: nueva carpeta */}
            <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderPlus className="w-5 h-5 text-primary" />
                            Nueva carpeta
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            autoFocus
                            placeholder="Nombre de la carpeta…"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateFolder();
                            }}
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowNewFolder(false)}>
                            Cancelar
                        </Button>
                        <Button variant="success" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                            Crear
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
};

export default ArchivesPage;