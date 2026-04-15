import type { ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
}

export const FieldRow = ({ label, children }: Props) => (
  <div className="material-editor__field-row">
    <span className="material-editor__field-label" title={label}>{label}</span>
    <div className="material-editor__field-control">{children}</div>
  </div>
)

interface SectionProps {
  title: string
}

export const Section = ({ title }: SectionProps) => (
  <div className="material-editor__section-title">{title}</div>
)
