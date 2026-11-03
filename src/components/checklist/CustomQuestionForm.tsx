import { useState } from 'react'
import { validateCustomQuestion } from '../../domain/customQuestions/customQuestions'
import { LIMITS } from '../../domain/limits'
import { TextArea } from '../common/TextArea'

const secondaryButton = 'rounded-md border border-slate-300 bg-white px-4 py-2'

export function CustomQuestionForm({
  name,
  label,
  initialText,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  name: string
  label: string
  initialText: string
  submitLabel: string
  onSubmit: (text: string) => void
  onCancel?: () => void
}) {
  const [text, setText] = useState(initialText)
  const [error, setError] = useState<string | undefined>()

  return (
    <form
      className="space-y-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = validateCustomQuestion(text)
        if (!result.ok) {
          setError(
            result.error === 'required'
              ? 'יש להזין את נוסח השאלה'
              : `אפשר להזין עד ${LIMITS.customQuestion} תווים`,
          )
          return
        }
        setError(undefined)
        onSubmit(result.text)
        setText('')
      }}
    >
      <TextArea
        name={name}
        label={label}
        value={text}
        maxLength={LIMITS.customQuestion}
        rows={2}
        error={error}
        onChange={(value) => {
          setText(value)
          setError(undefined)
        }}
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            ביטול
          </button>
        )}
      </div>
    </form>
  )
}
