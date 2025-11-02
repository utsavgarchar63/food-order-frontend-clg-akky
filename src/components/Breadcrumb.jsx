import { Link, useLocation } from "react-router-dom";

const Breadcrumb = ({ style }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbStyle = {
    marginBottom: "12px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    color: "#ffff",
    ...style
  };

  const listStyle = {
    listStyle: "none",
    display: "flex",
    padding: 0,
    margin: 0,
    gap: "5px",
  };

  const linkStyle = {
    textDecoration: "none",
    fontWeight: 500,
    cursor: "pointer"
  };

  const separatorStyle = {
    margin: "0 5px",
  };

  return (
    <nav style={breadcrumbStyle}>
      <ul style={listStyle}>
        <li>
          <Link to="/" style={linkStyle}>Home</Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const formatted = name.charAt(0).toUpperCase() + name.slice(1);

          return (
            <li key={index} style={{ display: "flex", alignItems: "center" }}>
              <span style={separatorStyle}>/</span>
              <Link to={routeTo} style={linkStyle}>
                {formatted}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
