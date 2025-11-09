import { BrowserRouter, Route, Routes } from "react-router"
import AuthProvider from "./context/auth-provider"
import LoginPage from "./pages/LoginPage"
import DashBoardLayout from "./layout/DashBoardLayout"
import DashboardStudent from "./pages/DashboardStudent"
import DashboardTeacher from "./pages/DashboardTeacher"
import CodeSessionPage from "./pages/CodeSessionPage"


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
            </Route>
            <Route path="teacher">
              <Route index element={<DashboardTeacher />} />
              <Route path="code-session/:idCourse" element={<CodeSessionPage />} />
            </Route>
          </Route>

          {/* </ProtectedRoute> */}
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
