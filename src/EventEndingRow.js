import PropTypes from 'prop-types'
import React from 'react'
import clsx from 'clsx'
import EventRowMixin from './EventRowMixin'
import { eventLevels } from './utils/eventLevels'
import range from 'lodash/range'

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot
let eventsInSlot = (segments, slot) =>
  segments.filter((seg) => isSegmentInSlot(seg, slot)).length

let getEventsFromSlot = (segments, slot) =>
  segments.filter((seg) => isSegmentInSlot(seg, slot)).map((s) => s.event)

class EventEndingRow extends React.Component {
  render() {
    let {
      segments,
      slotMetrics: { slots },
    } = this.props
    let rowSegments = eventLevels(segments).levels[0]

    let current = 1,
      lastEnd = 1,
      row = []

    while (current <= slots) {
      let key = '_lvl_' + current

      let { event, left, right, span } =
        rowSegments.filter((seg) => isSegmentInSlot(seg, current))[0] || {} //eslint-disable-line

      if (!event) {
        current++
        continue
      }

      let gap = Math.max(0, left - lastEnd)

      if (this.canRenderSlotEvent(left, span)) {
        let content = EventRowMixin.renderEvent(this.props, event)

        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }

        row.push(EventRowMixin.renderSpan(slots, span, key, content))

        lastEnd = current = right + 1
      } else {
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }

        row.push(
          EventRowMixin.renderSpan(
            slots,
            1,
            key,
            this.renderShowMore(segments, current)
          )
        )
        lastEnd = current = current + 1
      }
    }

    return <div className="rbc-row">{row}</div>
  }

  canRenderSlotEvent(slot, span) {
    let { segments } = this.props

    return range(slot, slot + span).every((s) => {
      let count = eventsInSlot(segments, s)

      return count === 1
    })
  }

  renderShowMore(segments, slot) {
    let { localizer, components, fullSegments } = this.props
    let count = eventsInSlot(segments, slot)
    let events = getEventsFromSlot(fullSegments, slot)
    let hiddenEvents = getEventsFromSlot(segments, slot)

    const ShowMore = components.showMoreButton
      ? components.showMoreButton
      : () => {
          return (
            <button
              type="button"
              key={'sm_' + slot}
              className={clsx('rbc-button-link', 'rbc-show-more')}
              onClick={(e) => this.showMore(slot, e)}
            >
              {localizer.messages.showMore(count)}
            </button>
          )
        }

    return count ? (
      <ShowMore
        key={'sm_' + slot}
        events={events}
        hiddenEvents={hiddenEvents}
        localizer={localizer}
      />
    ) : (
      false
    )
  }

  showMore(slot, e) {
    e.preventDefault()
    e.stopPropagation()
    this.props.onShowMore(slot, e.target)
  }
}

EventEndingRow.propTypes = {
  fullSegments: PropTypes.array,
  segments: PropTypes.array,
  slots: PropTypes.number,
  onShowMore: PropTypes.func,
  ...EventRowMixin.propTypes,
}

EventEndingRow.defaultProps = {
  ...EventRowMixin.defaultProps,
}

export default EventEndingRow
