import { useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: "uploading" | "completed" | "error";
}

// Datos de ejemplo
const initialFiles: FileItem[] = [
    { id: "1", name: "Presupuesto_2024.xlsx", type: "spreadsheet", size: 245000, uploadDate: new Date("2024-01-15"), status: "completed", folder: "Finanzas" },
    { id: "2", name: "Contrato_Alquiler.pdf", type: "pdf", size: 1250000, uploadDate: new Date("2024-01-10"), status: "completed", folder: "Documentos" },
    { id: "3", name: "Factura_Enero.pdf", type: "pdf", size: 89000, uploadDate: new Date("2024-01-20"), status: "completed", folder: "Finanzas" },
    { id: "4", name: "Foto_Perfil.jpg", type: "image", size: 2100000, uploadDate: new Date("2024-01-18"), status: "completed", folder: "Imágenes" },
    { id: "5", name: "Notas_Reunión.docx", type: "document", size: 45000, uploadDate: new Date("2024-01-22"), status: "completed", folder: "Trabajo" },
    { id: "6", name: "Backup_Datos.zip", type: "archive", size: 15000000, uploadDate: new Date("2024-01-05"), status: "completed", folder: "Backups" },
    { id: "7", name: "Presentación_Q1.pptx", type: "presentation", size: 5400000, uploadDate: new Date("2024-01-25"), status: "completed", folder: "Trabajo" },
    { id: "8", name: "Script_Automatización.py", type: "code", size: 12000, uploadDate: new Date("2024-01-28"), status: "completed", folder: "Código" },
];

const folders = ["Todos", "Finanzas", "Documentos", "Imágenes", "Trabajo", "Backups", "Código"];

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
    const [files, setFiles] = useState<FileItem[]>(initialFiles);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFolder, setSelectedFolder] = useState("Todos");
    const [selectedType, setSelectedType] = useState("all");
    const [isDragging, setIsDragging] = useState(false);

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

    // Simular subida de archivos
    const handleFilesSelected = useCallback((fileList: FileList) => {
        const newUploadingFiles: UploadingFile[] = Array.from(fileList).map((file) => ({
            id: `upload-${Date.now()}-${Math.random()}`,
            file,
            progress: 0,
            status: "uploading" as const,
        }));

        setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

        // Simular progreso de subida
        newUploadingFiles.forEach((uploadFile) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    // Marcar como completado y agregar a la lista
                    setUploadingFiles((prev) =>
                        prev.map((f) =>
                            f.id === uploadFile.id ? { ...f, progress: 100, status: "completed" as const } : f
                        )
                    );

                    // Agregar el archivo a la lista principal
                    const newFile: FileItem = {
                        id: `file-${Date.now()}-${Math.random()}`,
                        name: uploadFile.file.name,
                        type: getFileType(uploadFile.file.name),
                        size: uploadFile.file.size,
                        uploadDate: new Date(),
                        status: "completed",
                        folder: "Sin carpeta",
                    };
                    setFiles((prev) => [newFile, ...prev]);

                    // Remover de la lista de subida después de un momento
                    setTimeout(() => {
                        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadFile.id));
                    }, 2000);

                    toast.success(`${uploadFile.file.name} subido correctamente`);
                } else {
                    setUploadingFiles((prev) =>
                        prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: Math.round(progress) } : f))
                    );
                }
            }, 200);
        });
    }, []);

    const handleCancelUpload = (id: string) => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
        toast.info("Subida cancelada");
    };

    const handleDeleteFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        toast.success("Archivo eliminado");
    };

    const handleDownloadFile = (file: FileItem) => {
        toast.success(`Descargando ${file.name}...`);
    };

    const handlePreviewFile = (file: FileItem) => {
        toast.info(`Previsualizando ${file.name}`);
    };

    return (
        <PageContainer>
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/60 backdrop-blur border-border/60">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Folder className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalFiles}</p>
                                <p className="text-sm text-muted-foreground">Archivos totales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-card/60 backdrop-blur border-border/60">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <HardDrive className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                                <p className="text-sm text-muted-foreground">Espacio utilizado</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-card/60 backdrop-blur border-border/60">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <Upload className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{uploadingFiles.length}</p>
                                <p className="text-sm text-muted-foreground">En proceso</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                            <Button variant="outline" size="sm" className="gap-2">
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
        </PageContainer>
    );
};

export default ArchivesPage;