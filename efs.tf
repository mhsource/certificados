provider "aws" {
  region = "us-east-1"  # Substitua pela sua região AWS
}

resource "aws_efs_file_system" "airflow_efs" {
  creation_token = "airflow-efs"
  performance_mode = "generalPurpose"
}

resource "aws_efs_mount_target" "example" {
  count           = length(var.subnet_ids)
  file_system_id  = aws_efs_file_system.airflow_efs.id
  subnet_id       = element(var.subnet_ids, count.index)
  security_groups = var.security_group_ids
}

resource "aws_efs_access_point" "dags" {
  file_system_id = aws_efs_file_system.airflow_efs.id
  posix_user {
    uid = 1000
    gid = 1000
  }
  root_directory {
    path = "/airflow-dags"
    creation_info {
      owner_uid = 1000
      owner_gid = 1000
      permissions = "755"
    }
  }
}

resource "aws_efs_access_point" "logs" {
  file_system_id = aws_efs_file_system.airflow_efs.id
  posix_user {
    uid = 1000
    gid = 1000
  }
  root_directory {
    path = "/airflow-logs"
    creation_info {
      owner_uid = 1000
      owner_gid = 1000
      permissions = "755"
    }
  }
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}
