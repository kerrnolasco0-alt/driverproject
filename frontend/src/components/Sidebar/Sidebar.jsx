import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <div className="sidebar">

            <h2>
                DRIVER TRIP
                PLANNER
            </h2>

            <ul>

                <li>
                    <Link to="/">
                        Dashboard
                    </Link>
                </li>

                <li>
                    <Link to="/trip">
                        Create Trip
                    </Link>
                </li>

                <li>
                    <Link to="/route">
                        Route
                    </Link>
                </li>

                <li>
                    <Link to="/timeline">
                        Timeline
                    </Link>
                </li>

                <li>
                    <Link to="/logs">
                        Logs
                    </Link>
                </li>

                <li>
                    <Link to="/pdf">
                        PDF Preview
                    </Link>
                </li>

            </ul>

        </div>

    );
}

export default Sidebar;