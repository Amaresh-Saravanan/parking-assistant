import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";

// Eager load core pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better performance
const Driver = React.lazy(() => import("./pages/Driver"));
const Admin = React.lazy(() => import("./pages/Admin"));
const VideoEditor = React.lazy(() => import("./pages/VideoEditor"));
const Directions = React.lazy(() => import("./pages/Directions"));
const CameraManagement = React.lazy(() => {
  console.log('Loading CameraManagement component...');
  return import("./pages/CameraManagement").catch(error => {
    console.error('Failed to load CameraManagement:', error);
    throw error;
  });
});
const CameraPreview = React.lazy(() => import("./pages/CameraPreview"));
const CameraDetection = React.lazy(() => import("./pages/CameraDetection"));
const LiveCameraFeed = React.lazy(() => import("./pages/LiveCameraFeed"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/driver" element={
              <Suspense fallback={<LoadingScreen message="Loading driver interface..." />}>
                <Driver />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<LoadingScreen message="Loading admin dashboard..." />}>
                <Admin />
              </Suspense>
            } />
            <Route path="/video-editor" element={
              <Suspense fallback={<LoadingScreen message="Loading video editor..." />}>
                <VideoEditor />
              </Suspense>
            } />
            <Route path="/directions" element={
              <Suspense fallback={<LoadingScreen message="Loading directions..." />}>
                <Directions />
              </Suspense>
            } />
            {/* Camera Management Routes */}
            <Route path="/admin/cameras" element={
              <Suspense fallback={<LoadingScreen message="Loading camera management..." />}>
                <CameraManagement />
              </Suspense>
            } />
            <Route path="/admin/cameras/:id/preview" element={
              <Suspense fallback={<LoadingScreen message="Loading camera preview..." />}>
                <CameraPreview />
              </Suspense>
            } />
            <Route path="/admin/detection/:id" element={
              <Suspense fallback={<LoadingScreen message="Initializing YOLO detection..." />}>
                <CameraDetection />
              </Suspense>
            } />
            <Route path="/admin/live-feed" element={
              <Suspense fallback={<LoadingScreen message="Loading live feed simulator..." />}>
                <LiveCameraFeed />
              </Suspense>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
