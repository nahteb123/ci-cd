{{- define "ci-cd-web.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ci-cd-web.fullname" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ci-cd-web.labels" -}}
app.kubernetes.io/name: {{ include "ci-cd-web.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "ci-cd-web.selectorLabels" -}}
app: {{ include "ci-cd-web.fullname" . }}
{{- end -}}