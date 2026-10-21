// @vitest-environment jsdom

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import {
    cleanup,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError, postJson } from './api'
import WithdrawProposalButton from './WithdrawProposalButton'

vi.mock('./api', () => ({
    postJson: vi.fn(),

    ApiError: class extends Error {
        readonly status: number
        readonly errors: { field: string; message: string }[]

        constructor(
            status: number,
            message: string,
            errors: { field: string; message: string }[] = [],
        ) {
            super(message)
            this.name = 'ApiError'
            this.status = status
            this.errors = errors
        }
    },
}))

const postJsonMock = vi.mocked(postJson)

beforeEach(() => {
    vi.resetAllMocks()
})

afterEach(() => {
    cleanup()
})

describe('WithdrawProposalButton', () => {
    it('asks for confirmation before sending a request', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        expect(
            screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }),
        ).toBeTruthy()

        expect(postJsonMock).not.toHaveBeenCalled()
        expect(onWithdrawn).not.toHaveBeenCalled()
    })

    it('sends no request when withdrawal is cancelled', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Keep proposal',
            }),
        )

        expect(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        ).toBeTruthy()

        expect(
            screen.queryByRole('button', {
                name: 'Confirm withdrawal',
            }),
        ).toBeNull()

        expect(postJsonMock).not.toHaveBeenCalled()
        expect(onWithdrawn).not.toHaveBeenCalled()
    })

    it('withdraws the correct proposal with its version', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        postJsonMock.mockResolvedValue({
            id: 'proposal-456',
            status: 'WITHDRAWN',
        })

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }),
        )

        await waitFor(() => {
            expect(onWithdrawn).toHaveBeenCalledTimes(1)
        })

        expect(postJsonMock).toHaveBeenCalledTimes(1)

        expect(postJsonMock).toHaveBeenCalledWith(
            '/api/v1/projects/project-123/proposals/proposal-456/withdraw',
            {
                version: 2,
            },
        )

        expect(screen.getByRole('status').textContent).toContain(
            'Proposal withdrawn.',
        )

        expect(
            screen.queryByRole('button', {
                name: 'Withdraw proposal',
            }),
        ).toBeNull()
    })

    it('shows a backend rejection and allows retry or cancellation', async () => {
        const user = userEvent.setup()
        const onWithdrawn = vi.fn()

        const message =
            'This proposal has already been accepted and cannot be withdrawn.'

        postJsonMock.mockRejectedValue(new ApiError(409, message))

        render(
            <WithdrawProposalButton
                projectId="project-123"
                proposalId="proposal-456"
                proposalVersion={2}
                onWithdrawn={onWithdrawn}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }),
        )

        expect((await screen.findByRole('alert')).textContent).toBe(
            message,
        )

        expect(postJsonMock).toHaveBeenCalledTimes(1)
        expect(onWithdrawn).not.toHaveBeenCalled()
        expect(screen.queryByRole('status')).toBeNull()

        // Retry receives the same simulated rejection.
        await user.click(
            screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }),
        )

        await waitFor(() => {
            expect(postJsonMock).toHaveBeenCalledTimes(2)

            const confirmButton = screen.getByRole('button', {
                name: 'Confirm withdrawal',
            }) as HTMLButtonElement

            expect(confirmButton.disabled).toBe(false)
        })

        expect(screen.getByRole('alert').textContent).toBe(message)
        expect(onWithdrawn).not.toHaveBeenCalled()

        await user.click(
            screen.getByRole('button', {
                name: 'Keep proposal',
            }),
        )

        expect(screen.queryByRole('alert')).toBeNull()

        expect(
            screen.getByRole('button', {
                name: 'Withdraw proposal',
            }),
        ).toBeTruthy()

        expect(postJsonMock).toHaveBeenCalledTimes(2)
        expect(onWithdrawn).not.toHaveBeenCalled()
    })
})