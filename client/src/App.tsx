import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import WelcomeOptions from "@/pages/welcome-options";
import HasKit from "@/pages/has-kit";
import ScanQR from "@/pages/scan-qr";
import ConfirmKit from "@/pages/confirm-kit";
import Dashboard from "@/pages/dashboard";
import Lesson from "@/pages/lesson";
import CardReview from "@/pages/card-review";
import CardView from "@/pages/card-view";
import RealtimeTranslationPage from "@/pages/realtime-translation";
import OfflineVocabularyPage from "@/pages/offline-vocabulary";
import { UserProvider } from "@/context/user-context";
import { LessonProvider } from "@/context/lesson-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/lesson/:lessonId" component={Lesson} />
      <Route path="/card-review/:cardId" component={CardReview} />
      <Route path="/card-view/:cardId" component={CardView} />
      <Route path="/realtime-translation" component={RealtimeTranslationPage} />
      <Route path="/offline-vocabulary" component={OfflineVocabularyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <UserProvider>
      <LessonProvider>
        <Router />
        <Toaster />
      </LessonProvider>
    </UserProvider>
  );
}

export default App;
