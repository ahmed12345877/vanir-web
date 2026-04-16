import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";
import Reviews from "./pages/Reviews";
import Offers from "./pages/Offers";
import CaseStudies from "./pages/CaseStudies";
import Destinations from "./pages/Destinations";
import Programs from "./pages/Programs";
import Services from "./pages/Services";
import Vanir from "./pages/Vanir";
import PromoNotifications from "./components/PromoNotifications";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminGallery from "./pages/admin/AdminGallery";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/about"} component={About} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/booking"} component={Booking} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/offers"} component={Offers} />
      <Route path={"/case-studies"} component={CaseStudies} />
      <Route path={"/destinations"} component={Destinations} />
      <Route path={"/programs"} component={Programs} />
      <Route path={"/services"} component={Services} />
      <Route path={"/vanir"} component={Vanir} />
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/bookings">
        <AdminLayout>
          <AdminBookings />
        </AdminLayout>
      </Route>
      <Route path="/admin/reviews">
        <AdminLayout>
          <AdminReviews />
        </AdminLayout>
      </Route>
      <Route path="/admin/messages">
        <AdminLayout>
          <AdminMessages />
        </AdminLayout>
      </Route>
      <Route path="/admin/offers">
        <AdminLayout>
          <AdminOffers />
        </AdminLayout>
      </Route>
      <Route path="/admin/gallery">
        <AdminLayout>
          <AdminGallery />
        </AdminLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PromoNotifications />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
