import { createClient } from '@supabase/supabase-js'

// Use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log to verify environment variables are loaded (remove in production)
console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey ? 'Loaded' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Rest of your service code remains the same...
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
  }
}

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
    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData])
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
  }
}