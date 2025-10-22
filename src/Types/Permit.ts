import { Step1 } from "./Step1"
import { Step2 } from "./Step2"

export type Permit = {
    step1: Step1
    step2: Step2
    createdAt: string
    status: string
}