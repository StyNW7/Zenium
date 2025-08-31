import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

// Context
import { AuthProvider } from "@/contexts/authcontext";

// Route Components
import { ProtectedRoute, PublicRoute } from "@/components/protectedroute";

// Layout
import Layout from "@/layouts/root-layout";

// Utility Pages / Components
// import ScrollToTop from "./utility/ScrollToTop";
import ScrollToTopFunction from "./utility/ScrollToTopFunction";
import NotFoundPage from "./pages/Utility/NotFound404";
import LoadingScreen from "./pages/Utility/LoadingScreen";

// Pages
import LandingPage from "@/pages/Landing/page";
import LoginPage from "@/pages/Login/page";
import RegisterPage from "@/pages/Register/page";
import UserPage from "@/pages/User/page";
import RecommendationSystemPage from "@/pages/Recommendation-System/page";
import JournalingPage from "@/pages/Journaling/page";
import QuotePage from "./pages/Daily-Quote/page";
import MapPage from "@/pages/Map-System/page";
import MainPage from "@/pages/Main/page";
import ForgotPasswordPage from "./pages/Forgot-Password/page";
import Chatbot from "./components/Chatbot";

import ContentLibrary from "./pages/Content/page";
import ArticlePage from "./pages/Content/[id]/page";

import DashboardPage from "./pages/Dashboard/overview";

import MoodTrackerPage from "./pages/Dashboard/mood-tracker";
import MentalHealthPage from "./pages/Dashboard/mental-health";
import GoalsPage from "./pages/Dashboard/goals";
import TeamPage from "./pages/Utility/Team";
import LegalPage from "./pages/Utility/Legal";
import ContactPage from "./pages/Utility/Contact";
import ProfilePage from "./pages/Dashboard/profile";
import SessionsPage from "./pages/Dashboard/sessions";
import AchievementsPage from "./pages/Dashboard/achievements";

function App() {
  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTopFunction />
        {/* <ScrollToTop /> */}
        
        {appLoading && (
          <LoadingScreen onComplete={() => setAppLoading(false)} />
        )}

        <AnimatePresence mode="wait">
          {!appLoading && (
            <Routes>
              <Route path="/" element={<Layout />}>

                {/* Public Routes - hanya bisa diakses jika belum login */}
                <Route 
                  index 
                  element={
                    <PublicRoute> 
                      <LandingPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                 <Route 
                  path="/forgot-password" 
                  element={
                    <PublicRoute>
                      <ForgotPasswordPage />
                    </PublicRoute>
                  } 
                />

                <Route 
                  path="/content" 
                  element={
                    <ProtectedRoute>
                      <ContentLibrary />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/content/:id" 
                  element={
                    <ProtectedRoute>
                      <ArticlePage />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Routes - hanya bisa diakses setelah login */}
                <Route 
                  path="/main" 
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/user" 
                  element={
                    <ProtectedRoute>
                      <UserPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recommendation-system" 
                  element={
                    <ProtectedRoute>
                      <RecommendationSystemPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/journal" 
                  element={
                    <ProtectedRoute>
                      <JournalingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quote" 
                  element={
                    <ProtectedRoute>
                      <QuotePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/map" 
                  element={
                    <ProtectedRoute>
                      <MapPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/contact" 
                  element={
                    <ProtectedRoute>
                      <ContactPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/legal" 
                  element={
                    <ProtectedRoute>
                      <LegalPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/team" 
                  element={
                    <ProtectedRoute>
                      <TeamPage />
                    </ProtectedRoute>
                  } 
                /> 


                {/* User Dashboard */}

                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/dashboard/mental-health" 
                  element={
                    <ProtectedRoute>
                      <MentalHealthPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/dashboard/goals" 
                  element={
                    <ProtectedRoute>
                      <GoalsPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/dashboard/mood" 
                  element={
                    <ProtectedRoute>
                      <MoodTrackerPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/dashboard/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/dashboard/sessions" 
                  element={
                    <ProtectedRoute>
                      <SessionsPage />
                    </ProtectedRoute>
                  } 
                /> 

                <Route 
                  path="/dashboard/achievements" 
                  element={
                    <ProtectedRoute>
                      <AchievementsPage />
                    </ProtectedRoute>
                  } 
                /> 

              </Route>
              
              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />

            </Routes>

          )}
        </AnimatePresence>

        <Chatbot/>

        <Toaster position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;