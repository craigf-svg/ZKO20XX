use sysinfo::{
    Components, Disks, Networks, System,
};

#[tauri::command]
pub fn get_cpu_usage() -> f32 {
    let mut sys = System::new_all();
    sys.refresh_all();
    sys.global_cpu_info().cpu_usage()
}


