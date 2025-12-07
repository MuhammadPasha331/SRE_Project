const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
  try {
    const { username, name, password, position, isActive } = req.body;

    if (!username || !name || !password || !position) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingEmployee = await Employee.findOne({ username });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const employee = new Employee({
      username,
      name,
      password,
      position,
      isActive: isActive !== undefined ? isActive : true,
    });

    await employee.save();

    res.status(201).json({
      id: employee._id,
      username: employee.username,
      name: employee.name,
      position: employee.position,
      isActive: employee.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { name, position, password, isActive } = req.body;
    const updateData = { name, position };

    if (password) {
      updateData.password = password;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
