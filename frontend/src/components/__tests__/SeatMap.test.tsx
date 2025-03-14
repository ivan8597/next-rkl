import { render, screen, fireEvent } from '@testing-library/react'
import SeatMap from '../SeatMap'

const mockSeats = [
  { id: '1', number: 1, row: 1, status: 'available' as const, type: 'standard', price: 300, category: 'standard' },
  { id: '2', number: 2, row: 1, status: 'booked' as const, type: 'standard', price: 300, category: 'standard'},
  { id: '3', number: 3, row: 1, status: 'available' as const, type: 'standard', price: 300, category: 'standard'}
]

describe('SeatMap', () => {
  const mockSetSelectedSeats = jest.fn()

  beforeEach(() => {
    mockSetSelectedSeats.mockClear()
  })

  it('рендерит все места', () => {
    render(
      <SeatMap 
        seats={mockSeats} 
        selectedSeats={[]} 
        setSelectedSeats={mockSetSelectedSeats} 
      />
    )
    
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('обрабатывает выбор места', () => {
    render(
      <SeatMap 
        seats={mockSeats} 
        selectedSeats={[]} 
        setSelectedSeats={mockSetSelectedSeats} 
      />
    )

    const availableSeat = screen.getAllByRole('button')[0]
    fireEvent.click(availableSeat)
    
    expect(mockSetSelectedSeats).toHaveBeenCalledWith(['1'])
  })

  it('предотвращает выбор более 4 мест', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
    
    render(
      <SeatMap 
        seats={mockSeats} 
        selectedSeats={['4', '5', '6', '7']} 
        setSelectedSeats={mockSetSelectedSeats} 
      />
    )

    const availableSeat = screen.getAllByRole('button')[0]
    fireEvent.click(availableSeat)
    
    expect(mockAlert).toHaveBeenCalledWith('Можно выбрать не более 4 мест')
    expect(mockSetSelectedSeats).not.toHaveBeenCalled()
    
    mockAlert.mockRestore()
  })
}) 