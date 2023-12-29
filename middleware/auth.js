const { sign, verify } = require("jsonwebtoken");

exports.token = async (user) => {
  const accessToken = sign(
    { email: user.email, id: user.id },
    "qwertyuiopasdfghjklzxcvbnm"
  );
  return accessToken;
};

exports.validateToken = async (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) return res.redirect("/sessionExpired");

  try {
    const validToken = verify(accessToken, "qwertyuiopasdfghjklzxcvbnm");
    if (validToken) {
      return next();
    }
  } catch (err) {
    res.send(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("access-token");
  res.redirect("/");
};

exports.newValidateToken = async (req,res,next) => {
  const accessToken = req.headers.authorization;
  let alpha= accessToken.replace(/^Bearer\s+/, "");

  if (!accessToken)
  return res.send("Users not authenticated");
    
  try{
      const validToken = verify(alpha, "qwertyuiopasdfghjklzxcvbnm" )
      if(validToken) {
          return next();
      }
  }catch (err) {
  res.send(err);
  }
};

module.exports = exports;
