import {
    BrowserRouter,
    Routes,
    Route
}
from "react-router-dom";

import MainLayout from
"./layouts/MainLayout";

import DashboardPage from
"./pages/DashboardPage";

import CreateTripPage from
"./pages/CreateTripPage";

import RoutePage from
"./pages/RoutePage";

import TimelinePage from
"./pages/TimelinePage";

import LogsPage from
"./pages/LogsPage";

import PdfPage from
"./pages/PdfPage";


function App() {

    return (

        <BrowserRouter>

            <MainLayout>

                <Routes>

                    <Route
                        path="/"
                        element={
                            <DashboardPage />
                        }
                    />

                    <Route
                        path="/trip"
                        element={
                            <CreateTripPage />
                        }
                    />

                    <Route
                        path="/route"
                        element={
                            <RoutePage />
                        }
                    />

                    <Route
                        path="/timeline"
                        element={
                            <TimelinePage />
                        }
                    />

                    <Route
                        path="/logs"
                        element={
                            <LogsPage />
                        }
                    />

                    <Route
                        path="/pdf"
                        element={
                            <PdfPage />
                        }
                    />

                </Routes>

            </MainLayout>

        </BrowserRouter>

    );
}

export default App;