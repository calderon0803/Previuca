import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txwcgfzivliwsebaryin.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4d2NnZnppdmxpd3NlYmFyeWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjE0NzEsImV4cCI6MjA4MTE5NzQ3MX0.Q5hfzIzx-7OAK2J6vAX1qN5vSaUfEt_7Pdct9akVfCc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Probando conexión con Supabase...');

// Test 1: Verificar conexión
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Error obteniendo sesión:', error.message);
    } else {
      console.log('✅ Conexión con Supabase exitosa');
      console.log('📊 Sesión actual:', data.session ? 'Usuario autenticado' : 'No hay sesión activa');
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Test 2: Verificar tabla user_matches
async function testTable() {
  try {
    const { data, error } = await supabase
      .from('user_matches')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accediendo a tabla user_matches:', error.message);
      console.log('💡 Asegúrate de haber creado la tabla con el SQL del archivo DATABASE_SETUP.md');
    } else {
      console.log('✅ Tabla user_matches accesible');
      console.log('📝 Registros en tabla:', data.length);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Probar registro de usuario
async function testSignUp() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'test123456';
  
  try {
    console.log('\n🧪 Probando registro de usuario...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('❌ Error en registro:', error.message);
    } else {
      console.log('✅ Usuario creado exitosamente');
      console.log('📧 Email:', testEmail);
      console.log('👤 User ID:', data.user?.id);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar tests
(async () => {
  await testConnection();
  await testTable();
  await testSignUp();
  console.log('\n✨ Tests completados');
})();
