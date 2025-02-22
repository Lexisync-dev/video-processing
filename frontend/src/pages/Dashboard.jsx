import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { UploadCloud, FileAudio, Maximize, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ResizeDialog({ video, onResize }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onResize(video.videoId, parseInt(width), parseInt(height));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-none uppercase tracking-widest text-[10px]"
        >
          <Maximize className="mr-2 h-3 w-3" /> Resize
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Resize Sequence</DialogTitle>
          <DialogDescription className="uppercase tracking-widest text-xs font-sans mt-2">
            Specify new dimensions for {video.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`width-${video.videoId}`} className="text-right uppercase tracking-widest text-xs text-muted-foreground">
                Width
              </Label>
              <Input 
                id={`width-${video.videoId}`} 
                value={width} 
                onChange={(e) => setWidth(e.target.value)} 
                className="col-span-3 rounded-none bg-background border-border" 
                required 
                type="number"
                min="100"
                max="4000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`height-${video.videoId}`} className="text-right uppercase tracking-widest text-xs text-muted-foreground">
                Height
              </Label>
              <Input 
                id={`height-${video.videoId}`} 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                className="col-span-3 rounded-none bg-background border-border" 
                required 
                type="number"
                min="100"
                max="4000"
              />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-none uppercase tracking-widest text-xs py-6">
            Commence Processing
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchVideos = async () => {
    try {
      const res = await api.get('/videos');
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to fetch videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      await api.post('/upload-video', file, {
        headers: {
          'Content-Type': file.type,
          'filename': file.name
        }
      });
      await fetchVideos();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExtractAudio = async (videoId) => {
    try {
      await api.patch(`/video/extract-audio?videoId=${videoId}`);
      fetchVideos();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to extract audio');
    }
  };

  const handleResize = async (videoId, w, h) => {
    try {
      await api.put('/video/resize', { videoId, width: w, height: h });
      fetchVideos();
    } catch (err) {
      alert('Failed to start resize');
    }
  };

  if (loading && videos.length === 0) {
    return <div className="flex justify-center py-24 text-muted-foreground font-serif text-lg">Loading archives...</div>;
  }

  return (
    <div className="px-4 py-12 md:px-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-serif mb-2">Video Archives</h2>
          <p className="text-muted-foreground font-sans">Manage your uploaded film sequences.</p>
        </div>
        
        <div className="shrink-0">
          <input 
            type="file" 
            accept=".mp4,.mov" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="uppercase tracking-widest text-xs rounded-none px-6 py-6"
          >
            {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload Sequence'}
          </Button>
        </div>
      </div>

      <Separator className="mb-12" />

      {videos.length === 0 && !loading && (
        <div className="text-center py-24 border border-dashed border-border">
          <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-serif mb-2">The Archive is Empty</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Upload your first sequence to begin processing.</p>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {videos.map((video, idx) => (
          <div key={video.videoId}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Thumbnail */}
              <div className="w-full md:w-64 h-40 bg-secondary/50 flex-shrink-0 border border-border relative">
                <img 
                  src={`/get-video-asset?videoId=${video.videoId}&type=thumbnail`} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute top-2 left-2 bg-background border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest">
                  {video.extension}
                </div>
              </div>
              
              {/* Info & Actions */}
              <div className="flex-1 w-full">
                <h3 className="text-2xl font-serif mb-1">{video.name}</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-6">
                  {video.dimensions.width} × {video.dimensions.height}
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Button variant="outline" size="sm" asChild className="rounded-none uppercase tracking-widest text-[10px]">
                    <a href={`/get-video-asset?videoId=${video.videoId}&type=original`} download>
                      <Download className="mr-2 h-3 w-3" /> Original
                    </a>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-none uppercase tracking-widest text-[10px]"
                    onClick={() => handleExtractAudio(video.videoId)}
                    disabled={video.extractedAudio}
                  >
                    <FileAudio className="mr-2 h-3 w-3" /> 
                    {video.extractedAudio ? 'Audio Processed' : 'Extract Audio'}
                  </Button>

                  {video.extractedAudio && (
                    <Button size="sm" asChild className="rounded-none uppercase tracking-widest text-[10px]">
                      <a href={`/get-video-asset?videoId=${video.videoId}&type=audio`} download>
                        <Download className="mr-2 h-3 w-3" /> Audio File
                      </a>
                    </Button>
                  )}
                  
                  <ResizeDialog video={video} onResize={handleResize} />
                </div>

                {/* Resizes */}
                {Object.keys(video.resizes).length > 0 && (
                  <Card className="rounded-none shadow-none border-border bg-secondary/20">
                    <CardContent className="p-4">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Processed Versions</h4>
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(video.resizes).map(([dim, data]) => (
                          <div key={dim} className="flex items-center gap-3 bg-background border border-border px-3 py-2 text-sm">
                            <span className="font-serif">{dim}</span>
                            <Separator orientation="vertical" className="h-4" />
                            {data.processing ? (
                              <span className="text-primary text-xs uppercase tracking-widest flex items-center">
                                <Loader2 className="animate-spin mr-2 h-3 w-3" /> Processing
                              </span>
                            ) : (
                              <a href={`/get-video-asset?videoId=${video.videoId}&type=resize&dimensions=${dim}`} download className="text-xs uppercase tracking-widest hover:text-primary transition-colors flex items-center">
                                <Download className="mr-1 h-3 w-3" /> Download
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {idx < videos.length - 1 && <Separator className="my-12" />}
          </div>
        ))}
      </div>
    </div>
  );
}
