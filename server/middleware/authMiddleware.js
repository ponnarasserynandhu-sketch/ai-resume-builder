const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from Authorization header
  const authHeader = req.header("Authorization");
  
  // Check if Authorization header exists and has Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied. No token provided." 
    });
  }
  
  // Extract token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied. Token is missing." 
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user information to request object
    // Note: Your current structure uses decoded.user
    req.user = decoded.user || decoded;
    
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token has expired. Please login again." 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. Please login again." 
      });
    }
    
    // Generic error
    res.status(401).json({ 
      success: false, 
      message: "Authentication failed." 
    });
  }
};