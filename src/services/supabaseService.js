import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Team/Employee Service
export const teamService = {
  getEmployees: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
    return data
  },

  addEmployee: async (employee) => {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
    
    if (error) {
      console.error('Error adding employee:', error)
      throw error
    }
    return data[0]
  },

  updateEmployee: async (id, updates) => {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating employee:', error)
      throw error
    }
    return data[0]
  },

  deleteEmployee: async (id) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  },

  // New method to get employee by ID
  getEmployeeById: async (id) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching employee:', error)
      throw error
    }
    return data
  }
}

// Authentication Service
export const authService = {
  // Create employee with authentication credentials
  async createEmployeeWithAuth(employeeData) {
    try {
      // Extract auth data from employee data
      const { username, password, ...employeeInfo } = employeeData;
      
      // First create employee record
      const employee = await teamService.addEmployee(employeeInfo);
      
      // Create auth credentials (for now storing plain password - hash in production)
      const { data, error } = await supabase
        .from('employee_auth')
        .insert([
          {
            employee_id: employee.id,
            username: username,
            password_hash: password // In production, use bcrypt to hash this!
          }
        ])
        .select()
        .single();

      if (error) {
        // If auth creation fails, delete the employee record to maintain consistency
        await teamService.deleteEmployee(employee.id);
        throw error;
      }
      
      return employee;
    } catch (error) {
      console.error('Error creating employee with auth:', error);
      throw error;
    }
  },

  // Verify employee credentials
  async verifyEmployeeCredentials(username, password) {
    const { data, error } = await supabase
      .from('employee_auth')
      .select(`
        *,
        employees (*)
      `)
      .eq('username', username)
      .eq('password_hash', password) // In production, compare with bcrypt hash
      .single();

    if (error) {
      console.error('Error verifying credentials:', error);
      throw new Error('Invalid username or password');
    }
    
    if (!data || !data.employees) {
      throw new Error('Employee not found');
    }
    
    return data;
  },

  // Get employee auth by employee ID
  async getEmployeeAuth(employeeId) {
    const { data, error } = await supabase
      .from('employee_auth')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      console.error('Error fetching employee auth:', error);
      throw error;
    }
    return data;
  },

  // Update employee password
  async updateEmployeePassword(employeeId, newPassword) {
    const { data, error } = await supabase
      .from('employee_auth')
      .update({ 
        password_hash: newPassword, // Hash in production
        updated_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }
    return data;
  },

  // Check if username exists
  async checkUsernameExists(username) {
    const { data, error } = await supabase
      .from('employee_auth')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking username:', error);
      throw error;
    }
    
    return !!data; // Returns true if username exists
  }
}

// Template Service
export const templateService = {
  getTemplates: async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching templates:', error)
      throw error
    }
    return data
  },

  createTemplate: async (template) => {
    const { data, error } = await supabase
      .from('templates')
      .insert([template])
      .select()
    
    if (error) {
      console.error('Error creating template:', error)
      throw error
    }
    return data[0]
  },

  updateTemplate: async (id, updates) => {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating template:', error)
      throw error
    }
    return data[0]
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }
}

// Submission Service - FIXED COLUMN NAMES
export const submissionService = {
  getSubmissions: async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching submissions:', error)
      throw error
    }
    return data
  },

  submitForm: async (submissionData) => {
    // Convert camelCase to snake_case for database columns
    const submission = {
      employee_name: submissionData.employeeName,
      employee_email: submissionData.employeeEmail,
      employee_id: submissionData.employeeId,
      role: submissionData.role,
      template_id: submissionData.templateId,
      form_type: submissionData.formType,
      form_data: submissionData.formData,
      status: submissionData.status || 'submitted'
    };
    
    const { data, error } = await supabase
      .from('submissions')
      .insert([submission])
      .select()
    
    if (error) {
      console.error('Error submitting form:', error)
      throw error
    }
    return data[0]
  },

  deleteSubmission: async (id) => {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting submission:', error)
      throw error
    }
  },

  // New method to get submissions by employee ID
  getSubmissionsByEmployee: async (employeeId) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('employee_id', employeeId)
      .order('submitted_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching employee submissions:', error)
      throw error
    }
    return data
  }
}