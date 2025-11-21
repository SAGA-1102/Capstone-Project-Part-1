{{- define "admin.name" -}}
{{- default .Chart.Name .Values.nameOverride }}
{{- end -}}

{{- define "admin.fullname" -}}
{{ .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end -}}
