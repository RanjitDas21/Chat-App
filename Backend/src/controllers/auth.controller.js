import { User } from "../models/user.model.js";

const signup = async (req, res) => {
    const {fullName, email, password} = req.body;

    try {
        if (
            [fullName, email, password].some((field) => field?.trim() === "")
        ) {
            return res.status(400).json({message: "All fields are required"});
        }
    
        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
    
        // Check if emails valid: regex
        
        const emailRegex = /^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/igm;
        if(!emailRegex.test(email)) {
            return res.status(400).json({massage: "Invalid email format"});
        }
    
        const existedUser = await User.findOne({email})
    
        if(existedUser) {
            return res.status(400).json({message: "Email already exists"});
        }

        const newUser = await User.create({
            fullName,
            email,
            password,
        })

        const createdUser = await User.findById(newUser._id).select("-password")

        const options = {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === production,
            sameSite: process.env.NODE_ENV === production ? none : strict
        }
    
        if(createdUser) {
            const token = newUser.generateAuthToken();

            res.cookie("token", token, options)

            return res
            .status(201)
            .json({message: "User Registered Successfully",token, createdUser});

        } else {
            return res.status(500).json({message: "Something went wrong while registering the user"})
        }
    } catch (error) {
        console.log("Error in signup controller: ", error.message);
        res.status(500).json({message: "Internal server error123"}) 
    }

}

const login = async (req, res) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
    
        const user = await User.findOne({email})
    
        if (!user) {
            return res.status(404).json({message: "User does not exist"});
        }
    
        const isPasswordValid = await user.comparePassword(password);
    
        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid password"});
        }
    
        const token = await user.generateAuthToken();
    
        const loggedInUser = await User.findById(user._id).select("-password")
    
        const options = {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === production,
            sameSite: process.env.NODE_ENV === production ? none : strict
        }
    
        res.cookie("token", token, options)

        return res
        .status(201)
        .json({message: "User loged in successfully", token, loggedInUser})

    } catch (error) {
        console.log("Error in login controller: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === production,
            sameSite: process.env.NODE_ENV === production ? none : strict
        })
    
        return res
        .status(201)
        .json({message: "User logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller: ", error);
        res.status(500).json({message: "Internal server error"})
    }

}

export {
    signup,
    login,
    logout,
}