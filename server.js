// server.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect("mongodb://localhost:27017/pharmacy", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected Successfully");
    })
    .catch(err => {
        console.log("Database connection error:", err);
    });

const Medicine = mongoose.model('details', { 
    medicineName: String, 
    medicineType: String,
    cost: Number,
    quantity: Number
});

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/register', (req, res) => {
    const { medicineName, medicineType, cost, quantity } = req.body;
    
    const newMedicine = new Medicine({ medicineName, medicineType, cost, quantity });

    newMedicine.save()
        .then(() => {
            console.log("Medicine registered successfully");
            res.status(200).json({ message: 'Medicine registered successfully' });
        })
        .catch(error => {
            console.error("Error registering medicine:", error);
            res.status(500).json({ message: 'An error occurred' });
        });
});

app.post('/update', async (req, res) => {
    const { medicineName, newMedicineType, newCost, newQuantity } = req.body;
    try {
        const medicine = await Medicine.findOne({ medicineName }).exec();
        if (medicine) {
            medicine.medicineType = newMedicineType;
            medicine.cost = newCost;
            medicine.quantity = newQuantity;
            await medicine.save();
            console.log("Medicine updated successfully");
            res.status(200).json({ message: 'Medicine updated successfully' });
        } else {
            console.log("Medicine not found");
            res.status(404).json({ message: 'Medicine not found' });
        }
    } catch (error) {
        console.error("Error updating medicine:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/delete', async (req, res) => {
    const { medicineName } = req.body;
    try {
        const medicine = await Medicine.findOne({ medicineName }).exec();
        if (medicine) {
            await Medicine.deleteOne({ medicineName });
            console.log("Medicine deleted successfully");
            res.status(200).json({ message: 'Medicine deleted successfully' });
        } else {
            console.log("Medicine not found");
            res.status(404).json({ message: 'Medicine not found' });
        }
    } catch (error) {
        console.error("Error deleting medicine:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.get('/view', async (req, res) => {
    try {
        const medicines = await Medicine.find().exec();
        res.status(200).json(medicines);
    } catch (error) {
        console.error("Error fetching medicines:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
});
