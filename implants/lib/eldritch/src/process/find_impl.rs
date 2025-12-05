use super::list_impl::process_to_dict;
use anyhow::Result;
use sysinfo::{ProcessExt, System, SystemExt};
use starlark::values::{dict::Dict, Heap};

pub fn find_by_name(starlark_heap: &Heap, needle_name: String) -> Result<Vec<Dict<'_>>> {
    let mut out: Vec<Dict> = Vec::new();

    let mut sys = System::new();
    sys.refresh_processes();
    sys.refresh_users_list();

    for (pid, process) in sys.processes() {
        let name = process.name();
        if needle_name == name {
            out.push(process_to_dict(starlark_heap, &sys, *pid, process)?);
        }
    }

    Ok(out)
}
