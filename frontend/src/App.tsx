import { BrowserRouter, Route, Routes } from "react-router"
import AuthProvider from "./context/auth-provider"
import LoginPage from "./pages/LoginPage"
import DashBoardLayout from "./layout/DashBoardLayout"
import DashboardStudent from "./pages/DashboardStudent"
import AttendanceHistory from "./pages/AttendanceHistory"
import DashboardTeacher from "./pages/DashboardTeacher"
import CodeSessionPage from "./pages/CodeSessionPage"
import SessionHistory from "./pages/SessionHistory"


function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" index element={<LoginPage />} />

          {/* <ProtectedRoute> */}
          <Route path="dashboard" element={<DashBoardLayout />}>
            <Route path="student">
              <Route index element={<DashboardStudent />} />
              <Route path="attendance-history" element={<AttendanceHistory />} />
            </Route>
            <Route path="teacher">
              <Route index element={<DashboardTeacher />} />
              <Route path="code-session/:idCourse" element={<CodeSessionPage />} />
              <Route path="session-history" element={<SessionHistory />} />
            </Route>
          </Route>

          {/* </ProtectedRoute> */}
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
