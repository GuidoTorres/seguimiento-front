import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { OrdenCompraContext } from "../context/OrdenCompraContext";

export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  const { isLogged } = useContext(OrdenCompraContext);
  return !localStorage.getItem("token") ? <Navigate to="/" replace /> : children;
};
